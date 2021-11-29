#!/bin/bash

#causes the shell to exit if any subcommand or pipeline returns a non-zero status
set -e
#the shell running as pid 1 will replace itself with the command from the command line arguments
exec "$@"

