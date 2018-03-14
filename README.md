# campaigns-fb

Get campaign statistics from Facebook

```sh
# install dependencies
npm install

# get statistcs
FB_ACCESS_TOKEN="token" \
    FB_ACCOUNT_ID="act_0000000000000000" \
    FB_CLIENT_ID=0000000000000000 \
    FB_CLIENT_SECRET="xxxxxxxxxxxxxxxxxx" \
    DATE_FROM=`date -v-1m +%F` \
    DATE_TO=`date +%F` \
    SITE_MEDIUM="somemedium" \
    SITE_SOURCE="somesource" \
    SITE_DOMAIN="somedomain" \
    TABLE_NAME="db.table" \
    node index.js

# Result in file fb-YYYY-DD-MM.sql, where YYYY-DD-MM is ${DATE_TO}
```
