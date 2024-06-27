#### Group

To use group sdk client we need retrive from the SDK using `rumsanService.client`

```
  const groupClient =  getGroupClient(rumsanService.client);

```

As the mutation function or query function may contain some payload to be pass which are the parmaeter.

- #### create

```
groupClient.create
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

```
groupClient.list
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

```
groupClient.listById
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

```
groupClient.update
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

```
groupClient.purgeGroup
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

```
groupClient.remove
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

```
groupClient.deleteGroup

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

```h
groupClient.download

```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `uuid`    | `string` | UUID identifying the group |

| Response |
| :------- |

```
 success: true
```
