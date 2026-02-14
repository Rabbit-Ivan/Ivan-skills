SHELL := /bin/bash

.PHONY: skills-list skills-install skills-import skills-validate

skills-list:
	./scripts/skills-manager.sh list-self

skills-install:
	./scripts/skills-manager.sh install-self

skills-import:
	./scripts/skills-manager.sh import-from-agents $(if $(DRY_RUN),--dry-run,)

skills-validate:
	./scripts/skills-validate.sh
