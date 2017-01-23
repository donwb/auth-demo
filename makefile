#
# The include should be a single file that contains:
# export CLIENT_ID := {client id}
# export CLIENT_SECRET := {secret}
#
include env

$(info $$CLIENT_ID is [${CLIENT_ID}])
$(info $$CLIENT_SECRET is [${CLIENT_SECRET}])

all:
	DEBUG=auth-demo:* nodemon bin/www


.PHONY: alL