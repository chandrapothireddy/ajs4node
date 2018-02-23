#!/bin/bash

export NODE_ENV=development
export PORT=443

if [ $NODE_ENV == "development" ] && [ $PORT == 443 ]; then
        /root/.nvm/versions/node/v6.2.2/bin/forever -l /root/leaserep/logs/leaserep.log -a start /root/leaserep/leaserep16/server/server.js
        printf "\n\nNODE_ENV=%s, PORT=%d. Application STARTED!\n\n\n" $NODE_ENV $PORT
else
        printf "\n\nEither NODE_ENV=%s or PORT=%d is wrong! Application NOT started!\n\n\n" $NODE_ENV $PORT
fi

