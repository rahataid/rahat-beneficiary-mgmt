#### Targeting

To use targeting sdk client we need retrive from the SDK using `rumsanService.client`

```
  const targetingClient =  getAppClient(rumsanService.client);

```

As the mutation function or query function may contain some payload to be pass which are the parmaeter.

- #### create

```
targetingClient.create

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

```
targetingClient.list(payload)

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

```
targetingClient.exportTargetBeneficiary(inputData)
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

```
targetingClient.listByTargetUuid({
          target_uuid: target_uuid,
          query: payload,
        }),
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

```
targetingClient.search
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

- #### targets Result

```
targetingClient.targetResult
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

```
targetingClient.patchLabel
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

```
targetingClient.export
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

```
targetingClient.downloadPinnedBeneficiary

```

| Parameter      | Type     | Description                    |
| :------------- | :------- | :----------------------------- |
| ` target_uuid` | `string` | `uuid identifying the targets` |

| Response |
| :------- |

```
 success: true
```
