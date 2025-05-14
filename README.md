# Status

This repository regroups the configuration-as-code to deploy [OneUptime] on the EPFL OpenShift's infrastructure using [Ansible], wrapped in a convenient [suitcase], called [`statusible`](./statusible).

## Prerequisites

* Be member of the [Keybase] `/keybase/team/epfl_status/` team.
* Be member of the EPFL group `vra_p_svc0041`.


## Deploy

```bash
./statusible      # (--prod for production environment)
```

Deploy only the cluster (database, scheduled backups)

```bash
./statusible -t database
```

## Links
* https://status.epfl.ch/
* https://status-test.epfl.ch/


[OneUptime]: https://oneuptime.com
[Ansible]: https://ansible.com (Ansible is Simple IT Automation)
[suitcase]: https://github.com/epfl-si/ansible.suitcase (Install Ansible and its dependency stack into a temporary directory)
[Keybase]: https://keybase.io
