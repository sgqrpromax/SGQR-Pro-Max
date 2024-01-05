import pytest
from ape import project, chain, accounts

@pytest.fixture(scope="module")
def admin0(accounts):
	return accounts[0]

@pytest.fixture(scope="module")
def admin1(accounts):
	return accounts[1]

@pytest.fixture(scope="module")
def non_admin(accounts):
	return accounts[2]

@pytest.fixture(scope="module")
def deploy(project, admin0):
	return admin0.deploy(project.admin_management)

@pytest.fixture(scope="module")
def get_admin_list(current_instance):
	return current_instance.get_admins()

@pytest.fixture(scope="module")
def current_instance(project):
	return chain.contracts.get_deployments(project.admin_management)[-1]

def test_addition():
	assert 1 + 1 == 2

def test_admin_list(deploy, current_instance, get_admin_list, admin0, admin1):
	# Check if admin0 is in the admin list
	assert admin0.address in get_admin_list
	# Check if admin1 is not in the admin list
	assert admin1.address not in get_admin_list
	# Add admin1 to the admin list
	print(current_instance.address)
	receipt = current_instance.add_admins([str(admin1.address)], sender=admin0)

	print (receipt)
	# print (current_instance.admin_event.query("*")["event_name"][0])

	# Check if admin1 is in the admin list
	assert admin1.address in get_admin_list