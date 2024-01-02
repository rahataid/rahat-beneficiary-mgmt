const SHEET_NAME = 'Communities';
const SHEET_ID = '12dYbZgtxFXGPzWQFPG9Qe7NJpKUoMdbZh7O1dIO5NQM';

const { GoogleSpreadsheet } = require('google-spreadsheet');
const googleCreds = require('../config/google.json');
const axios = require('axios');
const data = require('./community_data.json');
const { generateWallet } = require('./generateWallet');

const communityHost = axios.create({
  baseURL: 'https://community-api-stage.rahat.io',
  // baseURL: 'http://localhost:5300',
});

function formatGoogleDriveURL(url) {
  if (!url || url === 'NA' || url === 'N/A') {
    return '';
  }
  const fileId = url.match(/\/d\/(.+?)\//)[1];
  const formattedURL = `https://drive.google.com/uc?export=view&id=${fileId}`;
  return formattedURL;
}

const lib = {
  async getKoboFormsData() {
    const doc = new GoogleSpreadsheet(SHEET_ID);
    await doc.useServiceAccountAuth(googleCreds);
    console.log('Loading Data');
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[SHEET_NAME];
    let rows = await sheet.getRows();

    console.log('Sanitizing Data');
    const sanitizedData = this.sanitizeRows(rows);

    for (const dataIndex in sanitizedData) {
      console.log('Posting Data', dataIndex);
      const rowData = rows[dataIndex];

      const {
        summaries,
        pilot,
        manager,
        tags,
        transactions,
        tx_description,
        category,
        ...commData
      } = sanitizedData[dataIndex];

      // if (!commData.address) {
      //   const wallet = await generateWallet(pilot);
      //   rowData.address = wallet.address;
      //   await rowData.save();
      //   console.log('address', wallet.address);
      // }

      const foundFromData = data.find((d) => d.address === commData.address);

      const createData = {
        ...commData,
        managers: [manager],
        summary: summaries,
        categoryId: category,

        tags: [tags],
        images: { ...(foundFromData?.images || null) },
        // name: foundFromData?.name || commData?.name,
        // description: foundFromData?.description || commData?.description,
      };

      console.log('createData', createData);

      const { data: communityData } = await communityHost.post(
        '/communities',
        createData,
      );
      console.log('data', communityData);

      // const { data } = await communityHost.post('/communities/manager', {
      //   communities: [commData.address],
      //   name: manager,
      // });
      // console.log('reacted manager', data);

      console.log('Saved', dataIndex + 1 + ' of ' + sanitizedData.length);
    }

    process.exit(0);
  },

  sanitizeRows(rows) {
    return rows.map((row) => this.sanitizeRow(row));
  },

  sanitizeRow(row) {
    return {
      name: row?.name?.replace(/\r?\n/g, '').trim(),
      category: Number(row?.category) || 7,
      manager: row.manager || '',
      description: row?.description?.replace(/\r?\n/g, '').trim() || '',
      tags: row?.tags,
      // images: {
      //   logo: row.logo ? formatGoogleDriveURL(row.logo) : '',
      //   cover: row.cover ? formatGoogleDriveURL(row.cover) : '',
      //   gallery: [],
      // },
      fundRaisedUsd: Number(row.tx_usd) || 0,
      localCurrency: row.country === 'Pakistan' ? 'wheels' : 'NPR',
      fundRaisedLocal: String(row?.tx_npr) || 0,
      longitude: Number(row.longitude) || '',
      latitude: Number(row.latitude) || '',
      country: row.country,
      pilot:
        row?.pilot?.toLowerCase().replace(' ', '_').replace('.0', '') || '',
      tx_description: row?.tx_description?.replace(/\r?\n/g, '').trim(),
      address: row?.address || null,

      transactions: {
        description: row.tx_description,
        npr: row.tx_npr || 0,
        usd: row.tx_usd || 0,
      },
      summaries: {
        total_beneficiaries: +row.total_beneficiaries || 0,
        gender_male: +row.gender_male || 0,
        gender_female: +row.gender_female || 0,
        gender_other: +row.gender_other || 0,
        bank_yes: +row.bank_yes || 0,
        bank_no: +row.bank_no || 0,
        // phone_yes: +row.phone_yes || null,
        // phone_no: +row.phone_no || null,
        internet_yes: +row.internet_yes || 0,
        internet_no: +row.internet_no || 0,
        extras: {},
      },
      // Add other properties you want to include in the JSON output
    };
  },
};

lib.getKoboFormsData();
