from ape import project, accounts, networks, chain
from ape.cli import network_option, NetworkBoundCommand, choices
from functools import wraps
import click
import os
import json
import sys

class deploy_uen_management:
	def __init__(
			self,
			network: str,
			sender: accounts = None,
			uen_management_instance: project = project.uen_management, 
			deployment: str = "latest",
			limit: int = 150,
			use_sample: bool = True,
			automatic: bool = True,
		):
		'''
		Class to check if the data has been dumped (or if the data has been updated) and uploads the data to the blockchain.
		TODO: Add non-local deployment, and add a way to check if the data has been updated.
		'''

		self.network_check()
		self.limit = limit
		self.sender = sender
		self.use_sample = use_sample
		self.network = network
		self.deployment = deployment
		
		self.local_uen_list: dict = {}
		self.uen_list_on_contract: list = []

		if self.use_sample:
			click.echo("Using sample data.")

		if self.network[-4:] == "test":
			self.sender = accounts.test_accounts[0] if sender is None else sender
			self.admin = self.sender.deploy(project.admin_management)
			self.uen_management = self.sender.deploy(uen_management_instance, str(self.admin.address))
			click.echo(f"The latest {uen_management_instance} contract is deployed at: {self.uen_management.address}")
		
		elif self.network == "ethereum:sepolia:alchemy":
			# TODO: Add options for other networks
			self.sender = accounts.load("tester1") if sender is None else sender
			self.sender.set_autosign(True)
			if deployment is None or deployment == "None":
					self.admin = self.sender.deploy(project.admin_management)
					self.uen_management = self.sender.deploy(uen_management_instance, str(self.admin.address))
					click.echo(f"The latest {uen_management_instance} contract is deployed at: {self.uen_management.address}")
			
			# If deployment is an address, use that address
			elif len(deployment) == 42:
				self.uen_management = uen_management_instance.at(deployment)
				click.echo(f"Using {uen_management_instance} contract at: {self.uen_management.address}")
			
			# If deployment is "latest", use the latest deployment
			elif deployment == "latest":
				self.uen_management = chain.contracts.get_deployments(uen_management_instance)[-1]
				click.echo(f"Using the latest deployed {uen_management_instance} contract at: {self.uen_management.address}")

		if automatic:
			# Automate the UEN upload process
			self.check_dump_return_list()
			self.get_all_uen()
			self.upload_data()
			self.get_name()

	def upload_data(self, local_uen_list: list = None, uen_list_on_contract: list = None):

		# Defaults
		if local_uen_list is None:
			local_uen_list = self.local_uen_list
		if uen_list_on_contract is None:
			uen_list_on_contract = self.uen_list_on_contract

		if set(self.local_uen_list.keys()) != set(self.uen_list_on_contract):
			click.echo("Data is different, updating now.")
			uen_list_to_push = []
			name_list_to_push = []
			count: int = 0
			for a in self.local_uen_list:
				if a not in self.uen_list_on_contract and count < self.limit:
					count += 1
					uen_list_to_push.append(a)
					name_list_to_push.append(self.local_uen_list[a])
			try:
				if self.network[-4:] == "test":
					self.uen_management.add_uens(uen_list_to_push, name_list_to_push, sender=self.sender, gas_limit=30029122)
				elif self.network == "ethereum:sepolia:alchemy":
					self.uen_management.add_uens(uen_list_to_push, name_list_to_push, sender=self.sender)
			except KeyboardInterrupt:
				click.echo("Keyboard interrupt detected, stopping the upload process.")
				sys.exit(0)
			except Exception as e:
				self.limit = self.limit // 2 if self.limit // 2 > 0 else 0
				click.echo(f"Error uploading data: {e}\nReducing the limit to {self.limit} and trying again.")
				self.upload_data()
			self.uen_list_on_contract = self.get_all_uen()
			click.echo(f"{count} entries added. Continue data update.\nCurrent data count on blockchain: {len(self.uen_list_on_contract)}, total data count on local: {len(self.local_uen_list)}")
			self.limit += 1
			self.upload_data()
		else:
			click.echo(f"Data is the same. Total data on both blockchain and local: {len(self.uen_list_on_contract)}")

	def check_dump_return_list(self, path: str = "scripts/uen_data/full_uen_filtered_list/", local_uen_list: dict = None) -> dict:
		'''
		Checks if the data has been dumped.
		'''

		# Defaults
		if local_uen_list is None:
			local_uen_list = self.local_uen_list

		if self.use_sample:
			path: str = "scripts/uen_data/sample/"

		if not os.path.exists(path=path):
			click.echo("Data has not been dumped. Dump the data from SG Gov first!")
			# TODO: Add a way to dump the data from govtech
		else:
			click.echo("Data exists, extracting the data.")
		
		for i in os.listdir(path=path):
			click.echo(f"Found {i} in {path}" + ("\n" if self.use_sample else ""))
			try:
				with open(path + i, "r") as f:
					# Load the file
					data = json.load(f)
					for a in data:
						local_uen_list[a["uen"]] = a["entity_name"]
						click.echo(f"{a['uen']}: {a['entity_name']}") if self.use_sample else None
			except:
				click.echo(f"Error opening {i} folder, skipping...")
				continue
		
		click.echo(f"\nFound {len(local_uen_list)} UENs in total.")
		return local_uen_list
	
	def get_name(self, limit: int = 10, uen_list: list = None) -> str:
		
		if uen_list is None:
			uen_list = self.uen_list_on_contract

		name_list: dict = {}

		click.echo(f"\nUENs on contract:")
		for b, a in enumerate(uen_list):
			if limit is not None:
				if b > limit:
					break
			name_list[a] = self.uen_management.get_name(a)
			click.echo(f"{a}: {name_list[a]}")
		return name_list

	def get_all_uen(self, uen_list_on_contract: list = None) -> list:
		'''
		Checks if the data has been uploaded to the blockchain.
		'''

		# Defaults
		if uen_list_on_contract is None:
			uen_list = self.uen_list_on_contract
		else:
			uen_list = uen_list_on_contract
		
		uen_list = self.uen_management.get_all_uens()
		click.echo(f'There are {len(uen_list)} UENs on the blockchain.')
		self.uen_list_on_contract = uen_list if uen_list_on_contract == None else None
		return uen_list

	@staticmethod
	def network_check() -> None:
		ecosystem_name = networks.provider.network.ecosystem.name
		network_name = networks.provider.network.name
		provider_name = networks.provider.name
		click.echo(f"You are connected to network '{ecosystem_name}:{network_name}:{provider_name}'.")

if __name__ == "__main__":
	click.echo("Run this script with 'ape run deploy_uen' instead. Run with --help to see help options.")

'''
CLI function starts here
'''
def _account_callback(ctx, param, value):
    return param.type.get_user_selected_account()

@click.command(cls=NetworkBoundCommand)
@click.option("--account", type=choices.AccountAliasPromptChoice(), callback=_account_callback)
@click.option("--use_sample", type=bool, default=True)
@click.option("--automatic", type=bool, default=True)
@click.option("--limit", type=int, default=150)
@click.option("--deployment", type=str, default="latest")
@network_option(required=True)
def cli(network, account, use_sample, automatic, limit, deployment):
	uen_management = deploy_uen_management(use_sample=use_sample, automatic=automatic, limit=limit, deployment=deployment, network=network, sender=account)