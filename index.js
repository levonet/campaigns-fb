const log = require('./lib/logger');
const storage = require('./lib/storage');
const adsSdk = require('facebook-nodejs-ads-sdk');

const accessToken = process.env.FB_ACCESS_TOKEN;
const accountId = process.env.FB_ACCOUNT_ID;
const clientId = process.env.FB_CLIENT_ID;
const clientSecret = process.env.FB_CLIENT_SECRET;
const dateFrom = process.env.DATE_FROM;
const dateTo = process.env.DATE_TO;
const siteMedium = process.env.SITE_MEDIUM || '';
const siteSource = process.env.SITE_SOURCE || '';
const siteDomain = process.env.SITE_DOMAIN || '';
const tableName = process.env.TABLE_NAME || '';

const api = adsSdk.FacebookAdsApi.init(accessToken);
const AdAccount = adsSdk.AdAccount;
const Campaign = adsSdk.Campaign;

const account = new AdAccount(accountId);
 
const insightsFields = [
    'campaign_name',
    'objective',
    'impressions',
    'spend',
    'clicks',
    'reach',
    'account_currency'
];

const insightsParams = {
    time_increment: 1,
    time_range: {
        since: dateFrom,
        until: dateTo
    }
};
 
account.read([AdAccount.Fields.name])
    .then((account) => {
        return account.getCampaigns([Campaign.Fields.name], { limit: 10 });
    }, (err) => {
        log.error(new Error(err), 'Error .read()');
        process.exit(1);
    })
    .then((campaigns) => {
        const campaign_ids = campaigns.map((campaign) => campaign.id)
        const campaignInsightsParams = Object.assign({
            level: 'campaign',
            filtering: [{ field: 'campaign.id', operator: 'IN', value: campaign_ids }]
        }, insightsParams);
        const campaigsInsightsFields = insightsFields.concat('campaign_id');

        return account.getInsights(campaigsInsightsFields, campaignInsightsParams);
    }, (err) => {
        log.error(new Error(err), 'Error .getCampaigns()');
        process.exit(1);
    })
    .then((insights) => {
        let data = [];

        for (let insight of insights) {
            const statistic = insight.exportAllData();

            data.push([
                '\'' + statistic.date_start + '\'',
                '\'' + 'facebook' + '\'',
                statistic.campaign_id,
                '\'' + statistic.campaign_name + '\'',
                '\'' + statistic.objective + '\'',
                '\'' + siteMedium + '\'',
                '\'' + siteSource + '\'',
                '\'' + siteDomain + '\'',
                parseInt(statistic.impressions),
                parseInt(statistic.clicks),
                parseFloat(statistic.spend),
                parseInt(statistic.reach),
                '\'' + statistic.account_currency + '\''
            ]);
        };

        return Promise.resolve(data);
    }, (err) => {
        log.error(new Error(err), 'Error .getInsights()');
        process.exit(1);
    })
    .then((data) => {
        storage.save(`fb-${dateTo}.sql`, tableName, data, [
            'dt_sys_partition',
            'campaign',
            'campaign_id',
            'campaign_name',
            'campaign_type',
            'medium',
            '"source"',
            '"domain"',
            'impressions',
            'clicks',
            'cost',
            'reach',
            'currency'
        ]);
    });
