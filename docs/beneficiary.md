#### Beneficiary

To use beneficiary sdk client we need retrive from the SDK using `rumsanService.client`

```
  const beneficiaryClient =  getBeneficiaryClient(rumsanService.client);

```

As the mutation function or query function may contain some payload to be pass which are the parmaeter.

- #### create

```
beneficiaryClient.create
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

```beneficiaryClient.list

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

```
beneficiaryClient.listById
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

```
beneficiaryClient.uploadBeneficiary

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

```
beneficiaryClient.update
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

```
beneficiaryClient.remove

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

```
beneficiaryClient.importBeneficiary

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

```
beneficiaryClient.getBeneficiaryStats

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

```
beneficiaryClient.listDistinctLocations
```

| Response |
| :------- |

```
 success: true
 data:     {
             location: string
           }

```
