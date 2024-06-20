# Community-tool

The Community Tool is designed to facilitate efficient management of beneficiary data, ensuring accuracy, reliability, and secure handling of non-PII (Personally Identifiable Information) data. It enables targeting beneficiaries based on geographical, social, economic, and physical indicators.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

```
PORT=5505
PORT_BEN=5501
PRIVATE_KEY=FILL_WITH_YOUR_PRIVATE_KEY
KOBO_URL= FILL_WITH_YOUR_KOBO_TOOL_URL
AUTH_TOKEN=FILL_WITH_YOUR_AUTH_TOKEN
```

JWT setup

```
JWT_SECRET_KEY=FILL_WITH_YOUR_SECRET_KEY
JWT_EXPIRATION_TIME=604800000
JWT_EXPIRATION_LONG_TIME=604800000
```

OTP time duration

```
OTP_DURATION_IN_SECS=300

```

Redis setup

```
REDIS_HOST= FILL_WITH_YOUR_REDIS_HOST
REDIS_PORT= FILL_WITH_YOUR_REDIS_PORT
REDIS_PASSWORD=FILL_WITH_YOUR_REDIS_PASSSWORD
```

Nest run in docker, change host to database container name

```
DB_HOST=FILL_WITH_YOUR_DB_HOST
DB_PORT=5432
DB_USERNAME= FILL_WITH_YOUR_USERNAME
DB_PASSWORD=FILL_WITH_YOUR_PASSWORD
DB_NAME= FILL_WITH_YOUR_DB_NAME
```

Prisma database connection

```
DATABASE_URL=postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public
```

SMTP setup

```
#Mailing Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USERNAME= FILL_WITH_YOUR_USERNAME
SMTP_PASSWORD= FILL_WITH_YOUR_PASSWORD
```

## Run Locally

Clone the project

```bash
  git clone https://github.com/rahataid/rahat-beneficiary-mgmt.git
```

Go to the project directory

```bash
  cd rahat-beneficiary-mgmt
```

Install dependencies

```bash
  pnpm install
```

Prisma migration

```bash
 npx prisma migrate dev
```

Start the server

```bash
  pnpm dev
```

## SDK Reference

#### APP CLIENT

- #### Get app status

```http
  GET /app/stats
```

| Parameter  | Type     | Description           |
| :--------- | :------- | :-------------------- |
| `location` | `string` | filter by location    |
| `ward_no`  | `string` | filter by ward number |

```
    success: true
    data:[]
```

- #### Post import kobo-tool form

```http
  Post /app/kobo-import/${name}
```

| Parameter | Type     | Description           |
| :-------- | :------- | :-------------------- |
| `name`    | `string` | name of the kobo tool |

- #### Get Kobo tools Settings

```http
  Get '/app/settings/kobotool'
```

- #### Get app settings by name

```http
  Get /app/settings/${name}
```

| Parameter | Type     | Description             |
| :-------- | :------- | :---------------------- |
| `name`    | `string` | name of the app setting |

#### SETTINGS CLIENT

- #### Create Settings

```http
  Post /settings
```

| Parameter        | Type              | Description                                              |
| :--------------- | :---------------- | :------------------------------------------------------- |
| `name`           | `string`          | name of the setting                                      |
| `value`          | `Object`          | structured data object containing key-value pairs        |
| `requiredFields` | `string[]`        | specifies which key should be present in value parameter |
| `isReadOnly`     | `boolean or null` |
| `isPrivate`      | `boolean or null` |

| Response |
| :------- |

```
    success: true
    data: [
            {
              name: string
              value: any
              dataType: string
              requiredFields: string[]
              isReadOnly: boolean
              isPrivate: boolean
            }
          ]
```

- #### List Settings

```http
  Get /app/settings
```

| Response |
| :------- |

```
  sucess: boolean
  data: any
```

#### Field Definition

- #### Create

```http
  Post /field-definitions
```

| Parameter       | Type       | Description                                                                                                                        |
| :-------------- | :--------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `name`          | `string`   | name of the field                                                                                                                  |
| `fieldType`     | `string`   | name of the field type                                                                                                             |
| `fieldPopulate` | `string[]` | an object that contains a key "data", which holds an array of objects containing key-value pairs in which key are labels and value |
| `isActive`      | `boolean`  |
| `isTargeting`   | `boolean`  |

| Response |
| :------- |

```
success: true
 data: [
         {
          name: string
          fieldType: string
          fieldPopulate: any
          isActive: boolean
          isTargeting: boolean
          createdAt: Date
          updatedAt: Date
         }
        ]

```

- #### list

```http
  Get /field-definitions
```

| Parameter | Type          | Description                                       |
| :-------- | :------------ | :------------------------------------------------ |
| `page`    | `number`      | **Required** number of page to be displayed on in |
| `perPage` | `number`      | **Required** list the number of data in a page    |
| `sort`    | `string`      | for sorting the data                              |
| `order`   | `asc or desc` |

| Response |
| :------- |

```
 success: true
 data: [
          {

            name: string
            fieldType: string
            fieldPopulate: any
            isActive: boolean
            isTargeting: boolean
            createdAt: Date
            updatedAt: Date
          }
        ]

```

- #### list by id

```http
  Get /field-definitions/{id}
```

| Parameter | Type     | Description                                |
| :-------- | :------- | :----------------------------------------- |
| `id`      | `string` | **Required** get the individual data by id |

| Response |
| :------- |

```
 success: true
 data:   {
            name: string
            fieldType: string
            fieldPopulate: any
            isActive: boolean
            isTargeting: boolean
            createdAt: Date
            updatedAt: Date
          }


```

- #### list Active

```http
  Get /field-definitions/active
```

| Parameter | Type          | Description                                       |
| :-------- | :------------ | :------------------------------------------------ |
| `page`    | `number`      | **Required** number of page to be displayed on in |
| `perPage` | `number`      | **Required** list the number of data in a page    |
| `sort`    | `string`      | for sorting the data                              |
| `order`   | `asc or desc` |

| Response |
| :------- |

```
 success: true
 data: [
          {

            name: string
            fieldType: string
            fieldPopulate: any
            isActive: boolean
            isTargeting: boolean
            createdAt: Date
            updatedAt: Date
          }
        ]


```

- #### update

```http
  Patch /field-definitions/{id}
```

| Parameter       | Type       | Description                                                                                                                        |
| :-------------- | :--------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `id`            | `string`   | **Required** get the individual data by id                                                                                         |
| `name`          | `string`   | name of the field                                                                                                                  |
| `fieldType`     | `string`   | name of the field type                                                                                                             |
| `fieldPopulate` | `string[]` | an object that contains a key "data", which holds an array of objects containing key-value pairs in which key are labels and value |
| `isActive`      | `boolean`  |
| `isTargeting`   | `boolean`  |

| Response |
| :------- |

```
 success: true
 data:   {
            name: string
            fieldType: string
            fieldPopulate: any
            isActive: boolean
            isTargeting: boolean
            createdAt: Date
            updatedAt: Date
          }

```

- #### toggle Status

```http
  Patch /field-definitions/{id}/status
```

| Parameter  | Type      | Description                                |
| :--------- | :-------- | :----------------------------------------- |
| `id`       | `string`  | **Required** get the individual data by id |
| `isActive` | `boolean` |

| Response |
| :------- |

```
 success: true
 data:   {
            name: string
            fieldType: string
            fieldPopulate: any
            isActive: boolean
            isTargeting: boolean
            createdAt: Date
            pdatedAt: Date
          }

```

- #### add bulk

```http
  Post /field-definitions/upload
```

| Parameter | Type  |
| :-------- | :---- |
| `file`    | `any` |

| Response |
| :------- |

```
 success: true
```

#### Beneficiary

- #### create

```http
  Post /beneficiaries
```

| Parameter        | Type             | Description                                                                  |
| :--------------- | :--------------- | :--------------------------------------------------------------------------- |
| `firstName`      | `string`         | First name of the beneficiary.                                               |
| `lastName`       | `string`         | Last name of the beneficiary.                                                |
| `gender`         | `Gender`         | Gender of the beneficiary (enum).                                            |
| `birthDate`      | `Date`           | Date of birth of the beneficiary.                                            |
| `walletAddress`  | `string`         | Blockchain wallet address of the beneficiary.                                |
| `phone`          | `string`         | Phone number of the beneficiary.                                             |
| `email`          | `string`         | Email address of the beneficiary.                                            |
| `location`       | `string`         | Current location of the beneficiary.                                         |
| `latitude`       | `number`         | Latitude coordinate of the beneficiary's location.                           |
| `longitude`      | `number`         | Longitude coordinate of the beneficiary's location.                          |
| `govtIDNumber`   | `string`         | Government ID number of the beneficiary.                                     |
| `notes`          | `string`         | Additional notes or comments related to the beneficiary.                     |
| `bankedStatus`   | `BankedStatus`   | Status indicating if the beneficiary is banked (enum).                       |
| `internetStatus` | `InternetStatus` | Status indicating internet connectivity (enum).                              |
| `phoneStatus`    | `PhoneStatus`    | Status indicating phone connectivity (enum).                                 |
| `extras`         | `Object`         | Additional custom data or attributes                                         |
| `createdAt`      | `Date`           | Timestamp indicating when the record was created.                            |
| `updatedAt`      | `Date`           | Timestamp indicating when the record was last updated.                       |
| `deletedAt`      | `Date`           | Timestamp indicating when the record was soft-deleted or marked as inactive. |

| Response |
| :------- |

```
 success: true
 data:     {
              id: string
              uuid: string
              firstName: string
              lastName: string
              gender: string
              birthDate: string
              walletAddress: string
              phone: string
              email: string
              location: string
              latitude: number
              longitude: number
              govtIDNumber: string
              notes: string
              bankedStatus: string
              internetStatus: string
              phoneStatus: string
              extras: {}
              createdAt: string
              updatedAt: string
              deletedAt: string
           }


```

- #### list

```http
  Get /beneficiaries
```

| Parameter | Type          | Description                                       |
| :-------- | :------------ | :------------------------------------------------ |
| `page`    | `number`      | **Required** number of page to be displayed on in |
| `perPage` | `number`      | **Required** list the number of data in a page    |
| `sort`    | `string`      | for sorting the data                              |
| `order`   | `asc or desc` |

| Response |
| :------- |

```
 success: true
 data:  [
           {
              id: string
              uuid: string
              firstName: string
              lastName: string
              gender: string
              birthDate: string
              walletAddress: string
              phone: string
              email: string
              location: string
              latitude: number
              longitude: number
              govtIDNumber: string
              notes: string
              bankedStatus: string
              internetStatus: string
              phoneStatus: string
              extras: {}
              createdAt: string
              updatedAt: string
              deletedAt: string
           }
        ]

```

- #### list by uuid

```http
  Get /beneficiaries/{uuid}
```

| Parameter | Type     | Description                              |
| :-------- | :------- | :--------------------------------------- |
| `uuid`    | `string` | **Required** get the beneficiary by uuid |

| Response |
| :------- |

```
 success: true
 data:     {
              id: string
              uuid: string
              firstName: string
              lastName: string
              gender: string
              birthDate: string
              walletAddress: string
              phone: string
              email: string
              location: string
              latitude: number
              longitude: number
              govtIDNumber: string
              notes: string
              bankedStatus: string
              internetStatus: string
              phoneStatus: string
              extras: {}
              createdAt: string
              updatedAt: string
              deletedAt: string
           }


```

- #### upload

```http
  Post /beneficiaries/upload
```

| Parameter | Type  |
| :-------- | :---- |
| `file`    | `any` |

| Response |
| :------- |

```
 success: true
```

- #### update

```http
  Put /beneficiaries/{uuid}
```

| Parameter        | Type             | Description                                                                  |
| :--------------- | :--------------- | :--------------------------------------------------------------------------- |
| `uuid`           | `string`         | uuid to upload the individual beneficiary                                    |
| `firstName`      | `string`         | First name of the beneficiary.                                               |
| `lastName`       | `string`         | Last name of the beneficiary.                                                |
| `gender`         | `Gender`         | Gender of the beneficiary (enum).                                            |
| `birthDate`      | `Date`           | Date of birth of the beneficiary.                                            |
| `walletAddress`  | `string`         | Blockchain wallet address of the beneficiary.                                |
| `phone`          | `string`         | Phone number of the beneficiary.                                             |
| `email`          | `string`         | Email address of the beneficiary.                                            |
| `location`       | `string`         | Current location of the beneficiary.                                         |
| `latitude`       | `number`         | Latitude coordinate of the beneficiary's location.                           |
| `longitude`      | `number`         | Longitude coordinate of the beneficiary's location.                          |
| `govtIDNumber`   | `string`         | Government ID number of the beneficiary.                                     |
| `notes`          | `string`         | Additional notes or comments related to the beneficiary.                     |
| `bankedStatus`   | `BankedStatus`   | Status indicating if the beneficiary is banked (enum).                       |
| `internetStatus` | `InternetStatus` | Status indicating internet connectivity (enum).                              |
| `phoneStatus`    | `PhoneStatus`    | Status indicating phone connectivity (enum).                                 |
| `extras`         | `Object`         | Additional custom data or attributes                                         |
| `createdAt`      | `Date`           | Timestamp indicating when the record was created.                            |
| `updatedAt`      | `Date`           | Timestamp indicating when the record was last updated.                       |
| `deletedAt`      | `Date`           | Timestamp indicating when the record was soft-deleted or marked as inactive. |

| Response |
| :------- |

```
 success: true
 data:     {
              id: string
              uuid: string
              firstName: string
              lastName: string
              gender: string
              birthDate: string
              walletAddress: string
              phone: string
              email: string
              location: string
              latitude: number
              longitude: number
              govtIDNumber: string
              notes: string
              bankedStatus: string
              internetStatus: string
              phoneStatus: string
              extras: {}
              createdAt: string
              updatedAt: string
              deletedAt: string
           }

```

- #### remove

```http
  Delete /beneficiaries/{uuid}
```

| Parameter | Type     | Description    |
| :-------- | :------- | :------------- |
| `uuid`    | `string` | uuid to remove |

| Response |
| :------- |

```
 success: true
 data:     {
              id: string
              uuid: string
              firstName: string
              lastName: string
              gender: string
              birthDate: string
              walletAddress: string
              phone: string
              email: string
              location: string
              latitude: number
              longitude: number
              govtIDNumber: string
              notes: string
              bankedStatus: string
              internetStatus: string
              phoneStatus: string
              extras: {}
              createdAt: string
              updatedAt: string
              deletedAt: string
           }

```

- #### import beneficiary

```http
  Get /beneficiary-imports/${source_uuid}/import
```

| Parameter     | Type     | Description        |
| :------------ | :------- | :----------------- |
| `source_uuid` | `string` | uuid of the source |

| Response |
| :------- |

```
 success: true
 data:     {
             success: boolean
             status: number
             message: string
           }

```

- #### beneficiaries stats

```http
  Get /beneficiaries/stats
```

| Response |
| :------- |

```
 success: true
 data:     {
             name: string
             data: any
             group: string
           }

```

- #### list distinct location

```http
  Get /beneficiaries/location
```

| Response |
| :------- |

```
 success: true
 data:     {
             location: string
           }

```

#### Group

- #### create

```http
  Post /group
```

| Parameter  | Type      | Description       |
| :--------- | :-------- | :---------------- |
| `name`     | `string`  | name of the group |
| `isSystem` | `boolean` |

| Response |
| :------- |

```
 success: true
 data:     {
               uuid: string
               isSystem: boolean
               id: number
               name: string
               createdAt: Date
               updatedAt: Date
           }

```

- #### list

```http
  Get /group
```

| Parameter | Type          | Description                                       |
| :-------- | :------------ | :------------------------------------------------ |
| `page`    | `number`      | **Required** number of page to be displayed on in |
| `perPage` | `number`      | **Required** list the number of data in a page    |
| `sort`    | `string`      | for sorting the data                              |
| `order`   | `asc or desc` |

| Response |
| :------- |

```
 success: true
 data:     {
               uuid: string
               isSystem: boolean
               id: number
               name: string
               beneficiariesGroup:[
                 {
                   beneficiary:{
                     id: string
                     uuid: string
                     firstName: string
                     lastName: string
                     gender: string
                     birthDate: string
                     walletAddress: string
                     phone: string
                     email: string
                     location: string
                     latitude: number
                     longitude: number
                     govtIDNumber: string
                     notes: string
                     bankedStatus: string
                     internetStatus: string
                     phoneStatus: string
                     extras: {}
                     createdAt: string
                     updatedAt: string
                     deletedAt: string
                   }
                 }
               ]
           }

```

- #### list by uuid

```http
  Get /group/{uuid}
```

| Parameter | Type     | Description                                       |
| :-------- | :------- | :------------------------------------------------ |
| `uuid`    | `string` | uuid of group                                     |
| `page`    | `number` | **Required** number of page to be displayed on in |
| `perPage` | `number` | **Required** list the number of data in a page    |

| Response |
| :------- |

```
 success: true
 data:     {
                id: number
                uuid: string
                beneficiaryId: number
                groupId: number
                createdAt: Date
                updatedAt: Date
                   beneficiary:{
                     id: string
                     uuid: string
                     firstName: string
                     lastName: string
                     gender: string
                     birthDate: string
                     walletAddress: string
                     phone: string
                     email: string
                     location: string
                     latitude: number
                     longitude: number
                     govtIDNumber: string
                     notes: string
                     bankedStatus: string
                     internetStatus: string
                     phoneStatus: string
                     extras: {}
                     createdAt: string
                     updatedAt: string
                     deletedAt: string
                   }
           }

```

- #### update

```http
  Put /group/{uuid}
```

| Parameter  | Type      | Description       |
| :--------- | :-------- | :---------------- |
| `uuid`     | `string`  | uuid of group     |
| `name`     | `string`  | name of the group |
| `isSystem` | `boolean` |

| Response |
| :------- |

```
 success: true
 data:     {
               uuid: string
               isSystem: boolean
               id: number
               name: string
               createdAt: Date
               updatedAt: Date
           }

```

- #### purge Group

```http
  Delete /group/purge
```

| Parameter         | Type       | Description                              |
| :---------------- | :--------- | :--------------------------------------- |
| `beneficiaryUuid` | `string[]` | Array of UUIDs identifying beneficiaries |
| `groupUuid`       | `string`   | UUID identifying the group               |

| Response |
| :------- |

```
 success: true
 data:     {
               uuid: string
               isSystem: boolean
               id: number
               name: string
               createdAt: Date
               updatedAt: Date
           }

```

- #### remove group

```http
  Delete /group/${uuid}/${deleteBeneficiaryFlag}
```

| Parameter               | Type      | Description                |
| :---------------------- | :-------- | :------------------------- |
| `uuid`                  | `string`  | UUID identifying the group |
| `deleteBeneficiaryFlag` | `boolean` |

| Response |
| :------- |

```
 success: true
 data:     {
               uuid: string
               isSystem: boolean
               id: number
               name: string
               createdAt: Date
               updatedAt: Date
           }

```

- #### delete group

```http
  Delete /group/${uuid}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `uuid`    | `string` | UUID identifying the group |

| Response |
| :------- |

```
 success: true
 data:     {
               message: string
               flag: string
           }

```

- #### download group

```http
  Post /group/download
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `uuid`    | `string` | UUID identifying the group |

| Response |
| :------- |

```
 success: true
```

#### Beneficiary Group

- #### create

```http
  Post /beneficiary-group
```

| Parameter        | Type       | Description                              |
| :--------------- | :--------- | :--------------------------------------- |
| `beneficiaryUID` | `string[]` | Array of UUIDs identifying beneficiaries |
| `groupUID`       | `string`   | UUID identifying the group               |

| Response |
| :------- |

```
 success: true
 data:     {
               beneficiaryUID: string[]
               groupUID: number
           }

```

- #### list

```http
  Get /beneficiary-group
```

| Parameter | Type          | Description                                       |
| :-------- | :------------ | :------------------------------------------------ |
| `page`    | `number`      | **Required** number of page to be displayed on in |
| `perPage` | `number`      | **Required** list the number of data in a page    |
| `sort`    | `string`      | for sorting the data                              |
| `order`   | `asc or desc` |

| Response |
| :------- |

```
 success: true
 data:     [
            {

               beneficiaryUID: string[]
               groupUID: number
            }
          ]

```

- #### list by uuid

```http
  Get /beneficiary-group/${uuid}
```

| Parameter | Type     | Description                            |
| :-------- | :------- | :------------------------------------- |
| `uuid`    | `string` | UUID identifying the beneficiary group |

| Response |
| :------- |

```
 success: true
 data:     {
               beneficiaryUID: string[]
               groupUID: number
           }

```

- #### update

```http
    Put /beneficiary-group/${uuid}

```

| Parameter        | Type       | Description                              |
| :--------------- | :--------- | :--------------------------------------- |
| `uuid`           | `string`   | UUID identifying the beneficiary group   |
| `beneficiaryUID` | `string[]` | Array of UUIDs identifying beneficiaries |
| `groupUID`       | `string`   | UUID identifying the group               |

| Response |
| :------- |

```
 success: true
 data:     {
               beneficiaryUID: string[]
               groupUID: number
           }

```

- #### remove

```http
    Delete /beneficiary-group/${uuid}

```

| Parameter | Type     | Description                            |
| :-------- | :------- | :------------------------------------- |
| `uuid`    | `string` | UUID identifying the beneficiary group |

| Response |
| :------- |

```
 success: true
 data:     {
               beneficiaryUID: string[]
               groupUID: number
           }

```

#### Source

- #### create

```http
  Post /sources
```

| Parameter      | Type                   | Description                                       |
| :------------- | :--------------------- | :------------------------------------------------ |
| `action`       | `string \| undefined`  | Optional action associated with the entity.       |
| `name`         | `string`               | Name of the entity.                               |
| `isImported`   | `boolean \| undefined` | Indicates if the entity is imported.              |
| `details`      | `any`                  | Additional details or data related to the entity. |
| `fieldMapping` | `any`                  | Mapping of fields related to the entity.          |

| Response |
| :------- |

```
 success: true
 data:     {
                id: number
                action: string
                uuid: `${string}-${string}-${string}-${string}-${string}`
                name: string
                isImported: boolean
                details: any
                fieldMapping: any
                createdAt: Date
                updatedAt: Date
           }

```

- #### list

```http
  Get /sources
```

| Response |
| :------- |

```
 success: true
 data:     [
             {
                id: number
                action: string
                uuid: `${string}-${string}-${string}-${string}-${string}`
                name: string
                isImported: boolean
                details: any
                fieldMapping: any
                createdAt: Date
                updatedAt: Date
            }
          ]

```

- #### list by uuid

```http
  Get /sources/{uuid}
```

| Parameter | Type     | Description                 |
| :-------- | :------- | :-------------------------- |
| `uuid`    | `string` | UUID identifying the source |

| Response |
| :------- |

```
 success: true
 data:
             {
                id: number
                action: string
                uuid: `${string}-${string}-${string}-${string}-${string}`
                name: string
                isImported: boolean
                details: any
                fieldMapping: any
                createdAt: Date
                updatedAt: Date
            }

```

- #### update

```http
  Put /sources/{uuid}
```

| Parameter      | Type                   | Description                                       |
| :------------- | :--------------------- | :------------------------------------------------ |
| `uuid`         | `string`               | UUID identifying the source                       |
| `action`       | `string \| undefined`  | Optional action associated with the entity.       |
| `name`         | `string`               | Name of the entity.                               |
| `isImported`   | `boolean \| undefined` | Indicates if the entity is imported.              |
| `details`      | `any`                  | Additional details or data related to the entity. |
| `fieldMapping` | `any`                  | Mapping of fields related to the entity.          |

| Response |
| :------- |

```
 success: true
 data:     {
                id: number
                action: string
                uuid: `${string}-${string}-${string}-${string}-${string}`
                name: string
                isImported: boolean
                details: any
                fieldMapping: any
                createdAt: Date
                updatedAt: Date
           }

```

- #### remove

```http
  Delete /sources/{uuid}
```

| Parameter | Type     | Description                 |
| :-------- | :------- | :-------------------------- |
| `uuid`    | `string` | UUID identifying the source |

| Response |
| :------- |

```
 success: true
 data:     {
                id: number
                action: string
                uuid: `${string}-${string}-${string}-${string}-${string}`
                name: string
                isImported: boolean
                details: any
                fieldMapping: any
                createdAt: Date
                updatedAt: Date
           }

```

- #### import id mapping

```http
  Get /sources/{importId}/mappings
```

| Parameter  | Type     |
| :--------- | :------- |
| `importId` | `string` |

| Response |
| :------- |

```
 success: true
```

#### Beneficiary Source

- #### create

```http
  Post /beneficiarySource
```

| Parameter        | Type     | Description                    |
| :--------------- | :------- | :----------------------------- |
| `source_id`      | `number` | id identifying the source      |
| `beneficiary_id` | `number` | id identifying the beneficiary |

```
 success: true
 data:     {
                id: number
                source_id: number
                beneficiary_id: number
                createdAt: Date
                updatedAt: Date
           }
```

- #### list

```http
  Get /beneficiarySource
```

| Response |
| :------- |

```
 success: true
 data:   [
          {
                id: number
                source_id: number
                beneficiary_id: number
                createdAt: Date
                updatedAt: Date
           }
          ]

```

- #### list by uuid

```http
  Get /beneficiarySource/{+id}
```

| Response |
| :------- |

```
 success: true
 data:
          {
                id: number
                source_id: number
                beneficiary_id: number
                createdAt: Date
                updatedAt: Date
           }
```

- #### upate

```http
  Put /beneficiarySource/{id}
```

| Parameter        | Type     | Description                           |
| :--------------- | :------- | :------------------------------------ |
| ` id`            | `number` | id identifying the beneficiary source |
| `source_id`      | `number` | id identifying the source             |
| `beneficiary_id` | `number` | id identifying the beneficiary        |

```
 success: true
 data:     {
                id: number
                source_id: number
                beneficiary_id: number
                createdAt: Date
                updatedAt: Date
           }
```

- #### remove

```http
  Delete /beneficiarySource/{id}
```

| Parameter | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| ` id`     | `number` | id identifying the beneficiary source |

```
 success: true
 data:     {
                id: number
                source_id: number
                beneficiary_id: number
                createdAt: Date
                updatedAt: Date
           }
```

#### Targeting

- #### create

```http
  Post /targets
```

| Parameter       | Type  |
| :-------------- | :---- |
| `filterOptions` | `any` |

```
 success: true
 data:     {
                message:string
           }
```

- #### list

```http
  Get /targets
```

| Parameter | Type          | Description                                       |
| :-------- | :------------ | :------------------------------------------------ |
| `page`    | `number`      | **Required** number of page to be displayed on in |
| `perPage` | `number`      | **Required** list the number of data in a page    |
| `sort`    | `string`      | for sorting the data                              |
| `order`   | `asc or desc` |

| Response |
| :------- |

```
 success: true
 data:     [
            {

               id: number
               updatedAt: Date
               createdAt: Date
               uuid: UUID
               label: string
               createdBy: UUID
               user: {
                   name: string
               }
            }
          ]

```

- #### export grouped beneficiaries

```http
  Get /targets/export
```

| Parameter    | Type      | Description                |
| :----------- | :-------- | :------------------------- |
| ` groupUUID` | `UUID`    | uuid identifying the group |
| `appURL`     | `string`` | appurl for export          |

| Response |
| :------- |

```
 success: true
 data:     [
            {
               message:string
            }
          ]

```

- #### list by target uuid

```http
  Get /targets/{target_uuid}/result
```

| Parameter      | Type          | Description                                       |
| :------------- | :------------ | :------------------------------------------------ |
| ` target_uuid` | `string`      | uuid identifying the targets                      |
| `page`         | `number`      | **Required** number of page to be displayed on in |
| `perPage`      | `number`      | **Required** list the number of data in a page    |
| `sort`         | `string`      | for sorting the data                              |
| `order`        | `asc or desc` |

| Response |
| :------- |

```
 success: true
 data:     [
            {

              id: number
              benefUuid: `${string}-${string}-${string}-${string}-${string}
              targetUuid: UUID
              createdAt: Date
              updatedAt: Date
              beneficiary: {
                     id: string
                     uuid: string
                     firstName: string
                     lastName: string
                     gender: string
                     birthDate: string
                     walletAddress: string
                     phone: string
                     email: string
                     location: string
                     latitude: number
                     longitude: number
                     govtIDNumber: string
                     notes: string
                     bankedStatus: string
                     internetStatus: string
                     phoneStatus: string
                     extras: {}
                     createdAt: string
                     updatedAt: string
                     deletedAt: string
              }
            }
          ]

```

- #### target Search

```http
  Post /targets/search
```

| Parameter        | Type  |
| :--------------- | :---- |
| ` filterOptions` | `any` |

| Response |
| :------- |

```
 success: true
 data:     [
                 {
                     id: string
                     uuid: string
                     firstName: string
                     lastName: string
                     gender: string
                     birthDate: string
                     walletAddress: string
                     phone: string
                     email: string
                     location: string
                     latitude: number
                     longitude: number
                     govtIDNumber: string
                     notes: string
                     bankedStatus: string
                     internetStatus: string
                     phoneStatus: string
                     extras: {}
                     createdAt: string
                     updatedAt: string
                     deletedAt: string

                   }
          ]

```

- #### target Search

```http
  Post /targets/targetResult
```

| Parameter        | Type     |
| :--------------- | :------- |
| ` filterOptions` | `any`    |
| ` targetUuid`    | `string` |

| Response |
| :------- |

```
 success: true
 data:
                 {

                     message:string
                 }
```

- #### patch label

```http
  Patch /targets/{uuid}/label
```

| Parameter  | Type     |
| :--------- | :------- |
| ` uuid`    | `string` |
| ` payload` | `any`    |

| Response |
| :------- |

```
 success: true
 data:
                 {

                      id: number
                      updatedAt: Date
                      createdAt: Date
                      uuid: UUID
                      label: string
                      filterOptions:any
                      status: enum
                      createdAt: Date
                      updatedAt: Date

                 }
```

- #### export

```http
  Post /targets/export/{targetUUID}
```

| Parameter     | Type     | Description                    |
| :------------ | :------- | :----------------------------- |
| ` targetUuid` | `string` | `uuid identifying the targets` |

| Response |
| :------- |

```
 success: true
 data:
                 {

                     message:string
                 }
```

- #### download Pinned Beneficiary

```http
  Post /targets/{target_uuid}/download
```

| Parameter      | Type     | Description                    |
| :------------- | :------- | :----------------------------- |
| ` target_uuid` | `string` | `uuid identifying the targets` |

| Response |
| :------- |

```
 success: true
```
