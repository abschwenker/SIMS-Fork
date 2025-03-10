-include ../.env
export $(shell sed 's/=.*//' ../.env)

.DEFAULT_GOAL := default
export GIT_LOCAL_BRANCH?=$(shell git rev-parse --abbrev-ref HEAD)
export NAMESPACE := $(or $(NAMESPACE), $$NS)
export APP_NAME := $(or $(PROJECT_NAME), sims)
export BUILD_ID := $(or $(BUILD_ID), 1)
export TEMPLATE_FILE_NAME := $(or $(TEMPLATE_FILE_NAME), $$FILE)
export BUILD_REF := $(or $(BUILD_REF), $(GIT_LOCAL_BRANCH))
export BUILD_NAMESPACE := $(or $(BUILD_NAMESPACE), 0c27fb-tools)
export DOMAIN := $(or $(DOMAIN), apps.silver.devops.gov.bc.ca)
export HOST_PREFIX := $(or $(HOST_PREFIX), $$HOST_PREFIX)
export NEW_DB := $(or $(NEW_DB), $$NEW_DB)
export JOB_NAME := $(or $(JOB_NAME), $$JN)
export SITE_MINDER_LOGOUT_URL := $(or $(SITE_MINDER_LOGOUT_URL), https://logontest7.gov.bc.ca/clp-cgi/logoff.cgi)
export BACKUP_POSTGRESQL_APP_NAME := $(or $(BACKUP_POSTGRESQL_APP_NAME), postgresql-backup)
export BACKUP_MONGODB_APP_NAME := $(or $(BACKUP_MONGODB_APP_NAME), mongodb-backup)
export BACKUP_CONFIGMAP_NAME := $(or $(BACKUP_CONFIGMAP_NAME), backup-conf)
export BYPASS_CRA_INCOME_VERIFICATION := $(or $(BYPASS_CRA_INCOME_VERIFICATION), false)
export BYPASS_APPLICATION_SUBMIT_VALIDATIONS := $(or $(BYPASS_APPLICATION_SUBMIT_VALIDATIONS), false)
export SWAGGER_ENABLED := $(or ${SWAGGER_ENABLED}, true)
export APPLICATION_ARCHIVE_DAYS := $(or ${APPLICATION_ARCHIVE_DAYS}, 43)
export API := $(or ${API}, api-$(APP_NAME))
export WORKERS := $(or ${WORKERS}, workers-$(APP_NAME))
export QUEUE_CONSUMERS := $(or ${QUEUE_CONSUMERS}, queue-consumers-$(APP_NAME))
export WEB := $(or ${WEB}, web-$(APP_NAME))
export API_PORT := $(or ${API_PORT}, 7070)
export QUEUE_CONSUMERS_PORT := $(or ${QUEUE_CONSUMERS_PORT}, 7000)
export WEB_PORT := $(or ${WEB_PORT}, 3030)
export DATABASE_NAME_KEY := $(or ${DATABASE_NAME_KEY}, database-name)
export DB_NAME := $(or ${DB_NAME}, SIMSDB)
export SWAGGER_NAME := $(or ${SWAGGER_NAME}, swagger)
export API_BUILD_REF := $(or ${API_BUILD_REF}, api-${APP_NAME})
export WORKERS_BUILD_REF := $(or ${WORKERS_BUILD_REF}, workers-${APP_NAME})
export QUEUE_CONSUMERS_BUILD_REF := $(or ${QUEUE_CONSUMERS_BUILD_REF}, queue-consumers-${APP_NAME})
export WEB_BUILD_REF := $(or ${WEB_BUILD_REF}, web-${APP_NAME})

define QA_DB_NAME
"QASIMSDB"
endef

define BUILD_TAG
"$(subst /,-,$(BUILD_REF))-$(BUILD_ID)"
endef

define BUILD_TEMPLATE_PATH
"openshift/docker-build.yml"
endef

define HOST
"$(HOST_PREFIX)aest-sims.$(DOMAIN)"
endef

define DB_SERVICE_NAME
"patroni-master"
endef

define FORMSFLOW_FORMS_NAME
"forms-flow-forms"
endef

define FORMSFLOW_BPM_NAME
"forms-flow-bpm"
endef

define FORMSFLOW_API_NAME
"forms-flow-api"
endef

define FORMSFLOW_WEB_NAME
"forms-flow-web"
endef

define HAMONGO_DB_TEMPLATE_PATH
"openshift/forms-flow-ai/database/mongo-ha.yml"
endef

define HAMONGO_DB_PARAM_PATH
"openshift/forms-flow-ai/database/mongo-ha-param.yml"
endef

define SECRETS_PATRONI_DB_TEMPLATE_PATH
"openshift/forms-flow-ai/secrets/ffa-patroni-secrets.yml"
endef

define CREATE_FFA_DB_TEMPLATE_PATH
"openshift/forms-flow-ai/database/create-ffa-db.yml"
endef

define FFA_BPM_DB_NAME
"FFA_BPM_DB"
endef

define FFA_API_DB_NAME
"FFA_API_DB"
endef

define SECRETS_TEMPLATE_PATH
"openshift/forms-flow-ai/secrets/secrets.yml"
endef

define SECRETS_PARAM_PATH
"openshift/forms-flow-ai/secrets/secrets-param.yml"
endef

define FORM_AI_BUILD_TEMPLATE_PATH
"openshift/forms-flow-ai/build.yml"
endef

define FORM_AI_FORMS_DEPLOY_TEMPLATE_PATH
"openshift/forms-flow-ai/forms-deploy.yml"
endef

define FORM_AI_FORMS_URL
"$(HOST_PREFIX)aest-ffa-forms.$(DOMAIN)"
endef

define FORM_AI_BPM_DEPLOY_TEMPLATE_PATH
"openshift/forms-flow-ai/bpm-deploy.yml"
endef

define FORM_AI_BPM_URL
"$(HOST_PREFIX)aest-ffa-bpm.$(DOMAIN)"
endef

define FORM_AI_API_DEPLOY_TEMPLATE_PATH
"openshift/forms-flow-ai/api-deploy.yml"
endef

define FORM_AI_API_URL
"$(HOST_PREFIX)aest-ffa-api.$(DOMAIN)"
endef

define FORM_AI_WEB_DEPLOY_TEMPLATE_PATH
"openshift/forms-flow-ai/web-deploy.yml"
endef

define FORM_AI_WEB_URL
"$(HOST_PREFIX)aest-ffa-serviceflow.$(DOMAIN)"
endef

define WEB_PARAM_PATH
"openshift/forms-flow-ai/web-config.yml"
endef

define FORMSFLOW_SOURCE_REPO_URL
"https://github.com/AOT-Technologies/forms-flow-ai.git"
endef

define FORMSFLOW_SOURCE_REPO_BRANCH
"master"
endef

define SOURCE_REPOSITORY_REF
"main"
endef

define SOURCE_CONTEXT_DIR
"devops/forms-flow-ai/"
endef

define rollout_and_wait
@oc -n $(NAMESPACE) rollout status $1
endef


init-oc: | print-status init-project
oc-build-patroni: | print-status build-patroni
oc-deploy-patroni: | print-status deploy-patroni
oc-build-api: | print-status build-api
oc-deploy-api: | print-status deploy-api
oc-build-workers: | print-status build-workers
oc-deploy-workers: | print-status deploy-workers
oc-build-queue-consumers: | print-status build-queue-consumers
oc-deploy-queue-consumers: | print-status deploy-queue-consumers
oc-create-db: | print-status create-db
oc-build-web: | print-status build-web
oc-deploy-web: | print-status deploy-web

oc-create-qa-api-db: | print-status create-qa-api-db

oc-build-forms-flow-forms: | print-status build-forms-flow-forms
oc-build-forms-flow-bpm: | print-status build-forms-flow-bpm
oc-build-forms-flow-api: | print-status build-forms-flow-api
oc-build-forms-flow-web: | print-status build-forms-flow-web

oc-deploy-ha-mongo: | print-status deploy-ha-mongo
oc-deploy-forms-flow-db-secrets: | print-status deploy-forms-flow-db-secrets
oc-create-ffa-bpm-db: | print-status create-ffa-bpm-db
oc-create-ffa-api-db: | print-status create-ffa-api-db
oc-deploy-forms-flow-secrets: | print-status deploy-forms-flow-secrets

oc-deploy-forms-flow-forms: | print-status deploy-forms-flow-forms
oc-deploy-forms-flow-bpm: | print-status deploy-forms-flow-bpm
oc-deploy-forms-flow-api: | print-status deploy-forms-flow-api
oc-deploy-forms-flow-web: | print-status deploy-forms-flow-web

oc-build-forms-flow-ai: | print-status build-forms-flow-forms build-forms-flow-bpm build-forms-flow-api build-forms-flow-web
oc-forms-flow-ai-db: | print-status oc-deploy-forms-flow-db-secrets oc-create-ffa-bpm-db oc-create-ffa-api-db
oc-forms-flow-ai-secrets: | print-status oc-deploy-forms-flow-secrets
oc-deploy-forms-flow-ai: | print-status deploy-forms-flow-forms deploy-forms-flow-bpm deploy-forms-flow-api deploy-forms-flow-web

# Create/delete backup structure
# Create/delete config map shared accross postgresql and mongodb.
oc-db-backup-configmap-init: | print-status db-backup-configmap
oc-db-backup-configmap-delete: | print-status db-backup-configmap-delete
# Create/delete structure for postgresql.
oc-db-backup-init-postgresql: | print-status db-backup-build-postgresql db-backup-deploy-postgresql
oc-db-backup-delete-postgresql: | print-status db-backup-build-delete-postgresql db-backup-deploy-delete-postgresql
# Create/delete structure for mongodb.
oc-db-backup-init-mongodb: | print-status db-backup-build-mongodb db-backup-deploy-mongodb
oc-db-backup-delete-mongodb: | print-status db-backup-build-delete-mongodb db-backup-deploy-delete-mongodb

print-status:
	@echo " +---------------------------------------------------------+ "
	@echo " | Current Settings                                        | "
	@echo " +---------------------------------------------------------+ "
	@echo " | PROJECT:      			$(APP_NAME)"
	@echo " | BRANCH:       			$(BUILD_REF)"
	@echo " | NAMESPACE:    			$(NAMESPACE)"
	@echo " | BUILD_NAMESPACE:    $(BUILD_NAMESPACE)"
	@echo " +---------------------------------------------------------+ "
	@echo " | BUILD_ID: 	$(BUILD_ID) "
	@echo " | BUILD_TAG: 	$(BUILD_TAG) "
	@echo " | HOST NAME: 	$(HOST) "
	@echo " +---------------------------------------------------------+ "

init-project:
	@echo "Run initial set-up for the project, including network security\n" 
	@oc -n $(NAMESPACE) process -f openshift/networkpolicy.yml -p NAMESPACE=$(NAMESPACE) | oc -n $(NAMESPACE) apply -f -
	@oc -n $(BUILD_NAMESPACE) policy add-role-to-group system:image-puller system:serviceaccounts:$(NAMESPACE)

build-patroni:
	@oc -n $(BUILD_NAMESPACE) process -f $(BUILD_TEMPLATE_PATH)  -p NAME=patroni -p TAG="12-latest" -p BASE_IMAGE_NAME=postgres -p BASE_IMAGE_TAG="12" -p SOURCE_REPOSITORY_URL="https://github.com/BCDevOps/platform-services.git" -p SOURCE_REPOSITORY_REF="master" -p SOURCE_CONTEXT_DIR="apps/pgsql/patroni/docker" | oc -n $(BUILD_NAMESPACE) apply -f -
	@oc -n $(BUILD_NAMESPACE) start-build bc/patroni --wait

init-secrets:
	@echo "++\n Deploy SIMS Creds Secrets $(NAMESPACE) \n++"
	@oc -n $(NAMESPACE) process -f openshift/init-secrets.yml \
		-p NAME=sims-creds \
		-p SECRET_NAME=$(SECRET_NAME) \
		-p BCeID_WEB_SERVICE_ONLINE_SERVICE_ID=$(BCeID_WEB_SERVICE_ONLINE_SERVICE_ID) \
		-p BCeID_WEB_SERVICE_REQUESTER_USER_GUID=$(BCeID_WEB_SERVICE_REQUESTER_USER_GUID) \
		-p BCeID_WEB_SERVICE_AUTH_USER_NAME=$(BCeID_WEB_SERVICE_AUTH_USER_NAME) \
		-p BCeID_WEB_SERVICE_AUTH_USER_PASSWORD=$(BCeID_WEB_SERVICE_AUTH_USER_PASSWORD) \
		-p WORKFLOW_SA_USER_NAME=$(WORKFLOW_SA_USER_NAME) \
		-p WORKFLOW_SA_PASSWORD=$(WORKFLOW_SA_PASSWORD) \
		-p FORMS_SA_USER_NAME=$(FORMS_SA_USER_NAME) \
		-p FORMS_SA_PASSWORD=$(FORMS_SA_PASSWORD) \
		-p SIMS_API_CLIENT_ID=$(SIMS_API_CLIENT_ID) \
		-p SIMS_API_CLIENT_SECRET=$(SIMS_API_CLIENT_SECRET) \
		-p CRA_REQUEST_FOLDER=$(CRA_REQUEST_FOLDER) \
		-p CRA_RESPONSE_FOLDER=$(CRA_RESPONSE_FOLDER) \
		-p CRA_PROGRAM_AREA_CODE=$(CRA_PROGRAM_AREA_CODE) \
		-p CRA_ENVIRONMENT_CODE=$(CRA_ENVIRONMENT_CODE) \
		-p ATBC_USERNAME=$(ATBC_USERNAME) \
		-p ATBC_PASSWORD=$(ATBC_PASSWORD) \
		-p ATBC_APP=$(ATBC_APP) \
		-p ESDC_REQUEST_FOLDER=$(ESDC_REQUEST_FOLDER) \
		-p ESDC_RESPONSE_FOLDER=$(ESDC_RESPONSE_FOLDER) \
		-p ESDC_ENVIRONMENT_CODE=$(ESDC_ENVIRONMENT_CODE) \
		-p SFAS_RECEIVE_FOLDER=$(SFAS_RECEIVE_FOLDER) \
		-p INSTITUTION_REQUEST_FOLDER=$(INSTITUTION_REQUEST_FOLDER) \
		-p GC_NOTIFY_URL=$(GC_NOTIFY_URL) \
		-p GC_NOTIFY_API_KEY=$(GC_NOTIFY_API_KEY) \
		-p GC_NOTIFY_TO_ADDRESS=$(GC_NOTIFY_TO_ADDRESS) \
		-p ZEEBE_ADDRESS=$(ZEEBE_ADDRESS) \
		-p ZEEBE_CLIENT_ID=$(ZEEBE_CLIENT_ID) \
		-p ZEEBE_CLIENT_SECRET=$(ZEEBE_CLIENT_SECRET) \
		-p ZEEBE_AUTHORIZATION_SERVER_URL=$(ZEEBE_AUTHORIZATION_SERVER_URL) \
		| oc -n $(NAMESPACE) apply -f -

init-zone-b-sftp-secret:
	test -n $(INIT_ZONE_B_SFTP_SERVER)
	test -n $(INIT_ZONE_B_SFTP_SERVER_PORT)
	test -n $(INIT_ZONE_B_SFTP_USER_NAME)
	test -n $(INIT_ZONE_B_SFTP_PRIVATE_KEY_PASSPHRASE)
	@oc create secret generic zone-b-sftp -n $(NAMESPACE) \
		--from-literal=server=$(INIT_ZONE_B_SFTP_SERVER) \
		--from-literal=server-port=$(INIT_ZONE_B_SFTP_SERVER_PORT) \
		--from-literal=user-name=$(INIT_ZONE_B_SFTP_USER_NAME) \
		--from-literal=private-key-passphrase=$(INIT_ZONE_B_SFTP_PRIVATE_KEY_PASSPHRASE) \
		--from-file=private-key=./openshift/zone-b-private-key.cer \
		--dry-run=client -o yaml | oc apply -f -

init-artifactory-secret-credential:
	test -n $(NAMESPACE)
	@oc create secret docker-registry artifactory-secret-credential -n $(NAMESPACE) \
    	--docker-server=artifacts.developer.gov.bc.ca \
    	--docker-username=$(USERNAME) \
    	--docker-password=$(PASSWORD) \
    	--docker-email=$(USERNAME)@$(NAMESPACE).local
	@oc secrets link default artifactory-secret-credential
	@oc secrets link builder artifactory-secret-credential

build-api:
	test -n "$(BUILD_REF)"
	test -n "$(BUILD_NAMESPACE)"
	@echo "+\n++ BUILDING API with tag: $(BUILD_TAG)\n+"
	@oc -n $(BUILD_NAMESPACE) process -f $(BUILD_TEMPLATE_PATH) -p TAG=$(BUILD_TAG) -p SOURCE_REPOSITORY_REF=$(BUILD_REF) -p BASE_IMAGE_NAME="nodejs-16" -p BASE_IMAGE_TAG="1" -p BASE_IMAGE_REPO="artifacts.developer.gov.bc.ca/redhat-docker-remote/ubi8/" -p SOURCE_CONTEXT_DIR=sources/packages/backend -p DOCKER_FILE_PATH=apps/api/Dockerfile -p NAME=$(API) | oc -n $(BUILD_NAMESPACE) apply -f -
	@oc -n $(BUILD_NAMESPACE) start-build bc/$(API) --wait

build-workers:
	test -n "$(BUILD_NAMESPACE)"
	test -n "$(BUILD_REF)"
	test -n "$(BUILD_TAG)"
	test -n "$(WORKERS)"
	@echo "+\n++ BUILDING WORKERS with tag: $(BUILD_TAG)\n+"
	@oc -n $(BUILD_NAMESPACE) process -f $(BUILD_TEMPLATE_PATH) -p TAG=$(BUILD_TAG) -p SOURCE_REPOSITORY_REF=$(BUILD_REF) -p BASE_IMAGE_NAME="nodejs-16" -p BASE_IMAGE_TAG="1" -p BASE_IMAGE_REPO="artifacts.developer.gov.bc.ca/redhat-docker-remote/ubi8/" -p SOURCE_CONTEXT_DIR=sources/packages/backend -p DOCKER_FILE_PATH=apps/workers/Dockerfile -p NAME=$(WORKERS) | oc -n $(BUILD_NAMESPACE) apply -f -
	@oc -n $(BUILD_NAMESPACE) start-build bc/$(WORKERS) --wait

build-queue-consumers:
	test -n "$(BUILD_NAMESPACE)"
	test -n "$(BUILD_REF)"
	test -n "$(BUILD_TAG)"
	test -n "$(QUEUE_CONSUMERS)"
	@echo "+\n++ BUILDING QUEUE_CONSUMERS with tag: $(BUILD_TAG)\n+"
	@oc -n $(BUILD_NAMESPACE) process -f $(BUILD_TEMPLATE_PATH) -p TAG=$(BUILD_TAG) -p SOURCE_REPOSITORY_REF=$(BUILD_REF) -p BASE_IMAGE_NAME="nodejs-16" -p BASE_IMAGE_TAG="1" -p BASE_IMAGE_REPO="artifacts.developer.gov.bc.ca/redhat-docker-remote/ubi8/" -p SOURCE_CONTEXT_DIR=sources/packages/backend -p DOCKER_FILE_PATH=apps/queue-consumers/Dockerfile -p NAME=$(QUEUE_CONSUMERS) | oc -n $(BUILD_NAMESPACE) apply -f -
	@oc -n $(BUILD_NAMESPACE) start-build bc/$(QUEUE_CONSUMERS) --wait

build-web:
	test -n "$(BUILD_REF)"
	test -n "$(BUILD_NAMESPACE)"
	@echo "+\n++ BUILDING WEB with tag: $(BUILD_TAG)\n+"
	@oc -n $(BUILD_NAMESPACE) process -f $(BUILD_TEMPLATE_PATH) -p TAG=$(BUILD_TAG) -p SOURCE_REPOSITORY_REF=$(BUILD_REF) -p BASE_IMAGE_NAME="nodejs-16" -p BASE_IMAGE_TAG="1" -p BASE_IMAGE_REPO="artifacts.developer.gov.bc.ca/redhat-docker-remote/ubi8/" -p SOURCE_CONTEXT_DIR=sources/packages/web -p NAME=$(WEB) | oc -n $(BUILD_NAMESPACE) apply -f -
	@oc -n $(BUILD_NAMESPACE) start-build bc/$(WEB) --wait

init-patroni:
	@echo "++\n Init Patroni in $(NAMESPACE) \n++"
	@oc -n $(NAMESPACE) process -f openshift/patroni-pre-req.yml | oc -n $(NAMESPACE) apply -f -

init-redis:
	@echo "++\n Init Redis in $(NAMESPACE) \n++"
	@oc -n $(NAMESPACE) process -f openshift/redis-secrets.yml | oc -n $(NAMESPACE) apply -f -

deploy-patroni:
	@oc -n $(NAMESPACE) process -f openshift/patroni-deploy.yml -p BUILD_NAMESPACE=$(BUILD_NAMESPACE) -p IMAGE_STREAM_TAG=patroni:12-latest | oc -n $(NAMESPACE) apply -f -

deploy-redis:
	@oc -n $(NAMESPACE) process -f openshift/redis-ha-deploy.yml -p IMAGE_NAME="redis" -p IMAGE_TAG="6.2.7-alpine" -p IMAGE_REGISTRY="artifacts.developer.gov.bc.ca/docker-remote" | oc -n $(NAMESPACE) apply -f -

# Command to initialize the redis cluster.
# Make sure that all the redis pods are up and running before initializing the cluster.
init-redis-cluster:
	@oc exec -n $(NAMESPACE) -it redis-0 -- redis-cli -a $(oc get secret -n $(NAMESPACE) redis-creds -o jsonpath='{.data.password}' | base64 -d) --cluster create --cluster-replicas 1 $(oc get pods -n $(NAMESPACE) -l app=redis -o jsonpath='{range.items[*]}{.status.podIP}:6379 ')

create-db:
	test -n $(DB_NAME)
	test -n $(NAMESPACE)
	@echo "+\n++ Creating DB ($(DB_NAME)) in $(NAMESPACE) patroni db cluster"
	@oc -n $(NAMESPACE) process -f openshift/createdb-job.yml -p DB_NAME=$(DB_NAME) -p BUILD_NAMESPACE=$(BUILD_NAMESPACE) -p JOB_NAME=main | oc -n $(NAMESPACE) apply -f -

create-new-db:
	test -n $(NEW_DB)
	test -n $(NAMESPACE)
	test -n $(JOB_NAME)
	@echo "+\n++ Creating DB ($(NEW_DB)) in $(NAMESPACE) patroni db cluster"
	@oc -n $(NAMESPACE) process -f openshift/createdb-job.yml -p DB_NAME=$(NEW_DB) -p BUILD_NAMESPACE=$(BUILD_NAMESPACE) -p JOB_NAME=$(JOB_NAME) | oc -n $(NAMESPACE) apply -f -

deploy-api:
	test -n "$(NAMESPACE)"
	test -n "$(BUILD_NAMESPACE)"
	test -n "$(KEYCLOAK_REALM)"	
	test -n "$(KEYCLOAK_AUTH_URL)"
	test -n "$(BCeID_WEB_SERVICE_WSDL)"
	test -n "$(RULE_ENGINE_URL)"
	test -n "$(FORMS_URL)"
	test -n "$(SITE_MINDER_LOGOUT_URL)"
	test -n "$(FORMS_FLOW_API_URL)"
	test -n "$(ATBC_LOGIN_ENDPOINT)"
	test -n "$(ATBC_ENDPOINT)"
	test -n "$(DATABASE_NAME_KEY)"
	test -n "$(API)"
	test -n "$(API_SECRET_NAME)"
	test -n "$(SWAGGER_NAME)"
	test -n "$(API_PORT)"
	@echo "+\n++ Deploying API with tag: $(BUILD_TAG)\n+"
	@oc -n $(NAMESPACE) process -f openshift/api-deploy.yml \
		-p NAME=$(API) \
		-p API_SECRET_NAME=$(API_SECRET_NAME) \
		-p HOST_NAME=$(HOST) \
		-p PORT=$(API_PORT) \
		-p DB_SERVICE=$(DB_SERVICE_NAME) \
		-p BUILD_NAMESPACE=$(BUILD_NAMESPACE) \
		-p IMAGE_STREAM_TAG="$(API_BUILD_REF):$(BUILD_TAG)" \
		-p KEYCLOAK_REALM=$(KEYCLOAK_REALM) \
		-p KEYCLOAK_AUTH_URL=$(KEYCLOAK_AUTH_URL) \
		-p BCeID_WEB_SERVICE_WSDL=$(BCeID_WEB_SERVICE_WSDL) \
		-p RULE_ENGINE_URL=$(RULE_ENGINE_URL) \
		-p FORMS_URL=$(FORMS_URL) \
		-p BUILD_TAG=$(BUILD_TAG) \
		-p DATABASE_NAME_KEY=$(DATABASE_NAME_KEY) \
		-p SITE_MINDER_LOGOUT_URL=$(SITE_MINDER_LOGOUT_URL) \
		-p FORMS_FLOW_API_URL=$(FORMS_FLOW_API_URL) \
		-p ATBC_LOGIN_ENDPOINT=$(ATBC_LOGIN_ENDPOINT) \
		-p ATBC_ENDPOINT=$(ATBC_ENDPOINT) \
		-p BYPASS_APPLICATION_SUBMIT_VALIDATIONS=$(BYPASS_APPLICATION_SUBMIT_VALIDATIONS) \
		-p SWAGGER_ENABLED=$(SWAGGER_ENABLED) \
		-p APPLICATION_ARCHIVE_DAYS=$(APPLICATION_ARCHIVE_DAYS) \
		-p SWAGGER_NAME=$(SWAGGER_NAME) \
		| oc -n $(NAMESPACE) apply -f -
	$(call rollout_and_wait,dc/$(API))

deploy-workers:
	test -n "$(NAMESPACE)"
	test -n "$(BUILD_NAMESPACE)"
	test -n "$(BUILD_TAG)"
	test -n "$(WORKERS_BUILD_REF)"
	test -n "$(DB_SERVICE_NAME)"
	test -n "$(DATABASE_NAME_KEY)"
	test -n "$(WORKERS_SECRET_NAME)"
	test -n "$(WORKERS)"
	test -n "$(BYPASS_CRA_INCOME_VERIFICATION)"
	@echo "+\n++ Deploying Workers with tag: $(BUILD_TAG)\n+"
	@oc -n $(NAMESPACE) process -f openshift/workers-deploy.yml \
		-p NAME=$(WORKERS) \
		-p WORKERS_SECRET_NAME=$(WORKERS_SECRET_NAME) \
		-p BUILD_NAMESPACE=$(BUILD_NAMESPACE) \
		-p DB_SERVICE=$(DB_SERVICE_NAME) \
		-p IMAGE_STREAM_TAG="$(WORKERS_BUILD_REF):$(BUILD_TAG)" \
		-p BUILD_TAG=$(BUILD_TAG) \
		-p DATABASE_NAME_KEY=$(DATABASE_NAME_KEY) \
		-p BYPASS_CRA_INCOME_VERIFICATION=$(BYPASS_CRA_INCOME_VERIFICATION) \
		| oc -n $(NAMESPACE) apply -f -
	$(call rollout_and_wait,dc/$(WORKERS))

deploy-queue-consumers:
	test -n "$(NAMESPACE)"
	test -n "$(BUILD_NAMESPACE)"
	test -n "$(BUILD_TAG)"
	test -n "$(QUEUE_CONSUMERS_BUILD_REF)"
	test -n "$(DB_SERVICE_NAME)"
	test -n "$(DATABASE_NAME_KEY)"
	test -n "$(QUEUE_CONSUMERS_SECRET_NAME)"
	test -n "$(QUEUE_CONSUMERS)"
	test -n "$(QUEUE_CONSUMERS_PORT)"
	@echo "+\n++ Deploying Queues with tag: $(BUILD_TAG)\n+"
	@oc -n $(NAMESPACE) process -f openshift/queue-consumers-deploy.yml \
		-p NAME=$(QUEUE_CONSUMERS) \
		-p QUEUE_CONSUMERS_SECRET_NAME=$(QUEUE_CONSUMERS_SECRET_NAME) \
		-p BUILD_NAMESPACE=$(BUILD_NAMESPACE) \
		-p DB_SERVICE=$(DB_SERVICE_NAME) \
		-p IMAGE_STREAM_TAG="$(QUEUE_CONSUMERS_BUILD_REF):$(BUILD_TAG)" \
		-p BUILD_TAG=$(BUILD_TAG) \
		-p DATABASE_NAME_KEY=$(DATABASE_NAME_KEY) \
		-p PORT=$(QUEUE_CONSUMERS_PORT) \
		-p HOST_NAME=$(HOST) \
		| oc -n $(NAMESPACE) apply -f -
	$(call rollout_and_wait,dc/$(QUEUE_CONSUMERS))

deploy-web:
	test -n "$(NAMESPACE)"
	test -n "$(BUILD_NAMESPACE)"
	test -n "$(WEB)"
	test -n "$(WEB_PORT)"
	@echo "+\n++ Deploying WEB with tag: $(BUILD_TAG)\n+"
	@oc -n $(NAMESPACE) process -f openshift/web-deploy.yml -p NAME=$(WEB) -p PORT=$(WEB_PORT) -p HOST_NAME=$(HOST) -p BUILD_NAMESPACE=$(BUILD_NAMESPACE) -p IMAGE_STREAM_TAG="$(WEB_BUILD_REF):$(BUILD_TAG)"  | oc -n $(NAMESPACE) apply -f -
	$(call rollout_and_wait,dc/$(WEB))

create-qa-api-db:
	test -n $(QA_DB_NAME)
	test -n $(NAMESPACE)
	@echo "+\n++ Creating DB ($(QA_DB_NAME)) in $(NAMESPACE) patroni db cluster"
	@oc -n $(NAMESPACE) process -f openshift/createdb-job.yml -p DB_NAME=$(QA_DB_NAME) -p BUILD_NAMESPACE=$(BUILD_NAMESPACE) -p JOB_NAME=qa-api-db | oc -n $(NAMESPACE) apply -f -

build-forms-flow-forms:
	test -n "$(BUILD_NAMESPACE)"
	test -n "$(FORMSFLOW_FORMS_NAME)"
	test -n "$(SOURCE_REPOSITORY_REF)"
	test -n "$(BUILD_TAG)"
	test -n "$(SOURCE_CONTEXT_DIR)"
	test -n "$(FORM_AI_BUILD_TEMPLATE_PATH)"
	@echo "+\n++ BUILDING $(FORMSFLOW_FORMS_NAME)"
	@echo "+\n++ BUILDING $(FORMSFLOW_FORMS_NAME) DIR: $(SOURCE_CONTEXT_DIR)$(FORMSFLOW_FORMS_NAME) BuildFile:$(FORM_AI_BUILD_TEMPLATE_PATH) BUILD_TAG:$(BUILD_TAG)\n+"
	@oc -n $(BUILD_NAMESPACE) process -f $(FORM_AI_BUILD_TEMPLATE_PATH) -p NAME=$(FORMSFLOW_FORMS_NAME) -p TAG=$(BUILD_TAG) -p FORMSFLOW_SOURCE_REPO_URL=$(FORMSFLOW_SOURCE_REPO_URL) -p FORMSFLOW_SOURCE_REPO_BRANCH=$(FORMSFLOW_SOURCE_REPO_BRANCH) -p SOURCE_REPOSITORY_REF=$(SOURCE_REPOSITORY_REF) -p SOURCE_CONTEXT_DIR=$(SOURCE_CONTEXT_DIR)$(FORMSFLOW_FORMS_NAME)| oc -n $(BUILD_NAMESPACE) apply -f -
	@oc -n $(BUILD_NAMESPACE) start-build bc/$(FORMSFLOW_FORMS_NAME) --wait

build-forms-flow-bpm:
	test -n "$(BUILD_NAMESPACE)"
	test -n "$(FORMSFLOW_BPM_NAME)"
	test -n "$(SOURCE_REPOSITORY_REF)"
	test -n "$(SOURCE_CONTEXT_DIR)"
	test -n "$(FORM_AI_BUILD_TEMPLATE_PATH)"
	@echo "+\n++ BUILDING $(FORMSFLOW_BPM_NAME)"
	@echo "+\n++ BUILDING $(FORMSFLOW_BPM_NAME) DIR: $(SOURCE_CONTEXT_DIR)$(FORMSFLOW_BPM_NAME) BuildFile:$(FORM_AI_BUILD_TEMPLATE_PATH)\n+"
	@oc -n $(BUILD_NAMESPACE) process -f $(FORM_AI_BUILD_TEMPLATE_PATH) -p NAME=$(FORMSFLOW_BPM_NAME) -p TAG=$(BUILD_TAG) -p FORMSFLOW_SOURCE_REPO_URL=$(FORMSFLOW_SOURCE_REPO_URL) -p FORMSFLOW_SOURCE_REPO_BRANCH=$(FORMSFLOW_SOURCE_REPO_BRANCH) -p SOURCE_REPOSITORY_REF=$(SOURCE_REPOSITORY_REF) -p SOURCE_CONTEXT_DIR=$(SOURCE_CONTEXT_DIR)$(FORMSFLOW_BPM_NAME)| oc -n $(BUILD_NAMESPACE) apply -f -
	@oc -n $(BUILD_NAMESPACE) start-build bc/$(FORMSFLOW_BPM_NAME) --wait

build-forms-flow-api:
	test -n "$(BUILD_NAMESPACE)"
	test -n "$(FORMSFLOW_API_NAME)"
	test -n "$(SOURCE_REPOSITORY_REF)"
	test -n "$(SOURCE_CONTEXT_DIR)"
	test -n "$(FORM_AI_BUILD_TEMPLATE_PATH)"
	@echo "+\n++ BUILDING $(FORMSFLOW_API_NAME)"
	@echo "+\n++ BUILDING $(FORMSFLOW_API_NAME) DIR: $(SOURCE_CONTEXT_DIR)$(FORMSFLOW_API_NAME) BuildFile:$(FORM_AI_BUILD_TEMPLATE_PATH)\n+"
	@oc -n $(BUILD_NAMESPACE) process -f $(FORM_AI_BUILD_TEMPLATE_PATH) -p NAME=$(FORMSFLOW_API_NAME) -p TAG=$(BUILD_TAG) -p FORMSFLOW_SOURCE_REPO_URL=$(FORMSFLOW_SOURCE_REPO_URL) -p FORMSFLOW_SOURCE_REPO_BRANCH=$(FORMSFLOW_SOURCE_REPO_BRANCH) -p SOURCE_REPOSITORY_REF=$(SOURCE_REPOSITORY_REF) -p SOURCE_CONTEXT_DIR=$(SOURCE_CONTEXT_DIR)$(FORMSFLOW_API_NAME)| oc -n $(BUILD_NAMESPACE) apply -f -
	@oc -n $(BUILD_NAMESPACE) start-build bc/$(FORMSFLOW_API_NAME) --wait

build-forms-flow-web:
	test -n "$(BUILD_NAMESPACE)"
	test -n "$(FORMSFLOW_WEB_NAME)"
	test -n "$(SOURCE_REPOSITORY_REF)"
	test -n "$(SOURCE_CONTEXT_DIR)"
	test -n "$(FORM_AI_BUILD_TEMPLATE_PATH)"
	@echo "+\n++ BUILDING $(FORMSFLOW_WEB_NAME)"
	@echo "+\n++ BUILDING $(FORMSFLOW_WEB_NAME) DIR: $(SOURCE_CONTEXT_DIR)$(FORMSFLOW_WEB_NAME) BuildFile:$(FORM_AI_BUILD_TEMPLATE_PATH)\n+"
	@oc -n $(BUILD_NAMESPACE) process -f $(FORM_AI_BUILD_TEMPLATE_PATH) -p NAME=$(FORMSFLOW_WEB_NAME) -p TAG=$(BUILD_TAG) -p FORMSFLOW_SOURCE_REPO_URL=$(FORMSFLOW_SOURCE_REPO_URL) -p FORMSFLOW_SOURCE_REPO_BRANCH=$(FORMSFLOW_SOURCE_REPO_BRANCH) -p SOURCE_REPOSITORY_REF=$(SOURCE_REPOSITORY_REF) -p SOURCE_CONTEXT_DIR=$(SOURCE_CONTEXT_DIR)$(FORMSFLOW_WEB_NAME)| oc -n $(BUILD_NAMESPACE) apply -f -
	@oc -n $(BUILD_NAMESPACE) start-build bc/$(FORMSFLOW_WEB_NAME) --wait

deploy-ha-mongo:
	test -n "$(NAMESPACE)"
	@oc -n $(NAMESPACE) process -f $(HAMONGO_DB_TEMPLATE_PATH) --param-file=$(HAMONGO_DB_PARAM_PATH) | oc -n $(NAMESPACE) apply -f -

deploy-forms-flow-db-secrets:
	test -n "$(NAMESPACE)"
	@oc -n $(NAMESPACE) process -f $(SECRETS_PATRONI_DB_TEMPLATE_PATH) | oc -n $(NAMESPACE) apply -f -

create-ffa-bpm-db:
	test -n $(NAMESPACE)
	@echo "+\n++ Creating DB (FFA_BPM_DB) in $(NAMESPACE) patroni db cluster"
	@oc -n $(NAMESPACE) process -f $(CREATE_FFA_DB_TEMPLATE_PATH) -p DB_NAME=$(FFA_BPM_DB_NAME) -p BUILD_NAMESPACE=$(BUILD_NAMESPACE) -p JOB_NAME=bpm | oc -n $(NAMESPACE) apply -f -

create-ffa-api-db:
	test -n $(NAMESPACE)
	@echo "+\n++ Creating DB (FFA_API_DB) in $(NAMESPACE) patroni db cluster"
	@oc -n $(NAMESPACE) process -f $(CREATE_FFA_DB_TEMPLATE_PATH) -p DB_NAME=$(FFA_API_DB_NAME) -p BUILD_NAMESPACE=$(BUILD_NAMESPACE) -p JOB_NAME=api | oc -n $(NAMESPACE) apply -f -

deploy-forms-flow-secrets:
	test -n "$(NAMESPACE)"
	@oc -n $(NAMESPACE) process -f $(SECRETS_TEMPLATE_PATH) --param-file=$(SECRETS_PARAM_PATH) | oc -n $(NAMESPACE) apply -f -

deploy-forms-flow-forms:
	test -n "$(NAMESPACE)"
	test -n "$(BUILD_NAMESPACE)"
	@echo "+\n++ Deploying forms-flow-forms with tag: $(BUILD_TAG)\n+"
	@oc -n $(NAMESPACE) process -f $(FORM_AI_FORMS_DEPLOY_TEMPLATE_PATH) -p NAME=$(FORMSFLOW_FORMS_NAME) -p FFA_FORMS_URL=$(FORM_AI_FORMS_URL) -p TOOLS_NAMESPACE=$(BUILD_NAMESPACE) -p IMAGE_STREAM_TAG="$(BUILD_TAG)" | oc -n $(NAMESPACE) apply -f -
	$(call rollout_and_wait,dc/$(FORMSFLOW_FORMS_NAME))

deploy-forms-flow-bpm:
	test -n "$(NAMESPACE)"
	test -n "$(BUILD_NAMESPACE)"
	@echo "+\n++ Deploying forms-flow-bpm with tag: $(BUILD_TAG)\n+"
	@oc -n $(NAMESPACE) process -f $(FORM_AI_BPM_DEPLOY_TEMPLATE_PATH) -p NAME=$(FORMSFLOW_BPM_NAME) -p CAMUNDA_URL=$(FORM_AI_BPM_URL) -p TOOLS_NAMESPACE=$(BUILD_NAMESPACE) -p IMAGE_STREAM_TAG="$(BUILD_TAG)" | oc -n $(NAMESPACE) apply -f -
	$(call rollout_and_wait,dc/$(FORMSFLOW_BPM_NAME))

deploy-forms-flow-api:
	test -n "$(NAMESPACE)"
	test -n "$(BUILD_NAMESPACE)"
	@echo "+\n++ Deploying forms-flow-api with tag: $(BUILD_TAG)\n+"
	@oc -n $(NAMESPACE) process -f $(FORM_AI_API_DEPLOY_TEMPLATE_PATH) -p NAME=$(FORMSFLOW_API_NAME) -p WEBAPI_URL=$(FORM_AI_API_URL) -p TOOLS_NAMESPACE=$(BUILD_NAMESPACE) -p IMAGE_STREAM_TAG="$(BUILD_TAG)" | oc -n $(NAMESPACE) apply -f -
	$(call rollout_and_wait,dc/$(FORMSFLOW_API_NAME))

deploy-forms-flow-web:
	test -n "$(NAMESPACE)"
	test -n "$(BUILD_NAMESPACE)"
	@echo "+\n++ Deploying forms-flow-web with tag: $(BUILD_TAG)\n+"
	@oc -n $(NAMESPACE) process -f $(FORM_AI_WEB_DEPLOY_TEMPLATE_PATH) --param-file=$(WEB_PARAM_PATH) -p NAME=$(FORMSFLOW_WEB_NAME) -p FFAWEB_URL=$(FORM_AI_WEB_URL) -p TOOLS_NAMESPACE=$(BUILD_NAMESPACE) -p IMAGE_STREAM_TAG="$(BUILD_TAG)" | oc -n $(NAMESPACE) apply -f -
	$(call rollout_and_wait,dc/$(FORMSFLOW_WEB_NAME))

# Create database backup structure (build/configmap/deploy)

# Create the config map to be shared by POSTGRES and mongodb.
db-backup-configmap:
	test -n "$(NAMESPACE)"
	test -n "$(BACKUP_POSTGRESQL_APP_NAME)"
	test -n "$(BACKUP_MONGODB_APP_NAME)"
	@echo "+\n++ Creating configmap resources for database backups on $(NAMESPACE)\n+"
	oc -n $(NAMESPACE) create configmap $(BACKUP_CONFIGMAP_NAME) --from-file=./openshift/database-backup/backup.conf

db-backup-configmap-delete:
	test -n "$(NAMESPACE)"
	@echo "+\n++ Removing configmap resoures for database backups on $(NAMESPACE)\n+"
	oc -n $(NAMESPACE) delete configmap/$(BACKUP_CONFIGMAP_NAME)

# Create the POSTGRES structure
db-backup-build-postgresql:
	test -n "$(BUILD_NAMESPACE)"
	test -n "$(BACKUP_POSTGRESQL_APP_NAME)"
	@echo "+\n++ Creating build resources for database backups on $(BUILD_NAMESPACE)\n+"
	oc -n $(BUILD_NAMESPACE) process -f ./openshift/database-backup/backup-build.yaml \
		-p NAME=$(BACKUP_POSTGRESQL_APP_NAME) OUTPUT_IMAGE_TAG=v1 \
		-p BASE_IMAGE_FOR_BUILD=artifacts.developer.gov.bc.ca/docker-remote/centos/postgresql-12-centos7:20200917-804ef01 \
		| oc -n $(BUILD_NAMESPACE) apply -f -

db-backup-build-delete-postgresql:
	test -n "$(NAMESPACE)"
	test -n "$(BUILD_NAMESPACE)"
	test -n "$(BACKUP_POSTGRESQL_APP_NAME)"
	@echo "+\n++ Removing build resoures for database backups on $(NAMESPACE)\n+"
	oc -n $(BUILD_NAMESPACE) delete is/$(BACKUP_POSTGRESQL_APP_NAME) bc/$(BACKUP_POSTGRESQL_APP_NAME)

db-backup-deploy-postgresql:
	test -n "$(NAMESPACE)"
	test -n "$(BUILD_NAMESPACE)"
	test -n "$(BACKUP_POSTGRESQL_APP_NAME)"
	@echo "+\n++ Creating deploy config resoures for database backups on $(NAMESPACE)\n+"
	oc -n $(NAMESPACE) process -f ./openshift/database-backup/backup-deploy.yaml \
  	-p NAME=$(BACKUP_POSTGRESQL_APP_NAME) \
  	-p IMAGE_NAMESPACE=$(BUILD_NAMESPACE) \
  	-p SOURCE_IMAGE_NAME=$(BACKUP_POSTGRESQL_APP_NAME) \
  	-p TAG_NAME=v1 \
		-p FTP_SECRET_KEY=$(BACKUP_POSTGRESQL_APP_NAME)-ftp-secret \
  	-p BACKUP_VOLUME_NAME=$(BACKUP_POSTGRESQL_APP_NAME)-pvc \
		-p BACKUP_VOLUME_SIZE=20Gi \
  	-p VERIFICATION_VOLUME_SIZE=5Gi \
  	-p ENVIRONMENT_NAME=$(NAMESPACE) \
		-p CONFIG_MAP_NAME=$(BACKUP_CONFIGMAP_NAME) \
		-p VERIFICATION_VOLUME_NAME=$(BACKUP_POSTGRESQL_APP_NAME)-verification-pvc \
		-p DATABASE_SERVER_NAME=PATRONI_MASTER \
		-p DATABASE_SECRET_NAME=patroni-creds \
		-p DATABASE_SECRET_USER_KEY_NAME=superuser-username \
		-p DATABASE_SECRET_PASSWORD_KEY_NAME=superuser-password \
  	-p ENVIRONMENT_FRIENDLY_NAME='SIMS $(NAMESPACE) POSTGRESQL DB Backups' \
		| oc -n $(NAMESPACE) apply -f -	                                                                       

db-backup-deploy-delete-postgresql:
	test -n "$(NAMESPACE)"
	test -n "$(BACKUP_POSTGRESQL_APP_NAME)"
	@echo "+\n++ Removing deploy resoures for database backups on $(NAMESPACE)\n+"
	oc -n $(NAMESPACE) delete \
  	secret/$(BACKUP_POSTGRESQL_APP_NAME) \
  	secret/$(BACKUP_POSTGRESQL_APP_NAME)-ftp-secret \
  	dc/$(BACKUP_POSTGRESQL_APP_NAME) \
  	networkpolicy/$(BACKUP_POSTGRESQL_APP_NAME)
# The below PVCs are not deleted.
# pvc/$(BACKUP_POSTGRESQL_APP_NAME)-pvc \
# pvc/$(BACKUP_POSTGRESQL_APP_NAME)-verification-pvc \
	
# Create the MONGODB structure
db-backup-build-mongodb:
	test -n "$(BUILD_NAMESPACE)"
	test -n "$(BACKUP_MONGODB_APP_NAME)"
	@echo "+\n++ Creating build resources for database backups on $(BUILD_NAMESPACE)\n+"
	oc -n $(BUILD_NAMESPACE) process -f ./openshift/database-backup/backup-build.yaml \
		-p NAME=$(BACKUP_MONGODB_APP_NAME) OUTPUT_IMAGE_TAG=v1 \
		-p BASE_IMAGE_FOR_BUILD=artifacts.developer.gov.bc.ca/redhat-docker-remote/rhscl/mongodb-36-rhel7 \
		| oc -n $(BUILD_NAMESPACE) apply -f -

db-backup-build-delete-mongodb:
	test -n "$(NAMESPACE)"
	test -n "$(BUILD_NAMESPACE)"
	test -n "$(BACKUP_MONGODB_APP_NAME)"
	@echo "+\n++ Removing build resoures for database backups on $(NAMESPACE)\n+"
	oc -n $(BUILD_NAMESPACE) delete is/$(BACKUP_MONGODB_APP_NAME) bc/$(BACKUP_MONGODB_APP_NAME)

db-backup-deploy-mongodb:
	test -n "$(NAMESPACE)"
	test -n "$(BUILD_NAMESPACE)"
	test -n "$(BACKUP_MONGODB_APP_NAME)"
	@echo "+\n++ Creating deploy config resoures for database backups on $(NAMESPACE)\n+"
	oc -n $(NAMESPACE) process -f ./openshift/database-backup/backup-deploy.yaml \
  	-p NAME=$(BACKUP_MONGODB_APP_NAME) \
  	-p IMAGE_NAMESPACE=$(BUILD_NAMESPACE) \
  	-p SOURCE_IMAGE_NAME=$(BACKUP_MONGODB_APP_NAME) \
  	-p TAG_NAME=v1 \
		-p FTP_SECRET_KEY=$(BACKUP_MONGODB_APP_NAME)-ftp-secret \
  	-p BACKUP_VOLUME_NAME=$(BACKUP_MONGODB_APP_NAME)-pvc \
		-p BACKUP_VOLUME_SIZE=5Gi \
  	-p VERIFICATION_VOLUME_SIZE=1Gi \
  	-p ENVIRONMENT_NAME=$(NAMESPACE) \
		-p CONFIG_MAP_NAME=$(BACKUP_CONFIGMAP_NAME) \
		-p VERIFICATION_VOLUME_NAME=$(BACKUP_MONGODB_APP_NAME)-verification-pvc \
		-p DATABASE_SERVER_NAME=MONGO \
		-p DATABASE_SECRET_NAME=mongodb-creds \
		-p DATABASE_SECRET_USER_KEY_NAME=username \
		-p DATABASE_SECRET_PASSWORD_KEY_NAME=password \
  	-p ENVIRONMENT_FRIENDLY_NAME='SIMS $(NAMESPACE) MONGO DB Backups' \
		| oc -n $(NAMESPACE) apply -f -

db-backup-deploy-delete-mongodb:
	test -n "$(NAMESPACE)"
	test -n "$(BACKUP_MONGODB_APP_NAME)"
	@echo "+\n++ Removing deploy resoures for database backups on $(NAMESPACE)\n+"
	oc -n $(NAMESPACE) delete \
  	secret/$(BACKUP_MONGODB_APP_NAME) \
  	secret/$(BACKUP_MONGODB_APP_NAME)-ftp-secret \
  	dc/$(BACKUP_MONGODB_APP_NAME) \
  	networkpolicy/$(BACKUP_MONGODB_APP_NAME)
# The below PVCs are not deleted.
# pvc/$(BACKUP_MONGODB_APP_NAME)-pvc
# pvc/$(BACKUP_MONGODB_APP_NAME)-verification-pvc

# Remove redis and resources including secrets from openshift namespace.
delete-redis:
	@echo "+\n++ Removing redis and resources on $(NAMESPACE)\n+"
	@oc delete -n $(NAMESPACE) all,rc,svc,dc,route,pvc,secret,configmap,sa,RoleBinding -l app=redis