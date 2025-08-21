BACKEND_MAKE := $(MAKE) -C deps/bilitioo-backend

all: get-dep backend-all

backend-all: 
	$(BACKEND_MAKE) all

get-dep:
	bin/get-dep
