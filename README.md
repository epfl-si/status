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

## Tags & Update
By default, the tag used for the different images is `release`, which is defined in the `app_images_tag` in the [`roles/status-openshift/vars/main.yml`](./roles/status-openshift/vars/main.yml) file.

If you want to pull (from [OneUptime's Docker Hub]) & push (to [Quay svc0041's organization]) a new tag to some images, you can do so by running the following commands (example with the release tag, haraka's image) :

```sh
docker pull oneuptime/haraka:release
docker tag oneuptime/haraka:release quay-its.epfl.ch/svc0041/haraka:release
docker push quay-its.epfl.ch/svc0041/haraka:release
```

## Links
* https://status.epfl.ch/
* https://status-test.epfl.ch/


[OneUptime]: https://oneuptime.com
[Ansible]: https://ansible.com (Ansible is Simple IT Automation)
[suitcase]: https://github.com/epfl-si/ansible.suitcase (Install Ansible and its dependency stack into a temporary directory)
[Keybase]: https://keybase.io
[OneUptime's Docker Hub]: https://hub.docker.com/u/oneuptime
[Quay svc0041's organization]: https://quay-its.epfl.ch/organization/svc0041
