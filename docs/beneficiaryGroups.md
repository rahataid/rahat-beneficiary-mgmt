#### Beneficiary Group

To use beneficary grooup sdk client we need retrive from the SDK using `rumsanService.client`

```
  const beneficiaryGroupClient =  getBeneficiaryGroupClient(rumsanService.client);

```

As the mutation function or query function may contain some payload to be pass which are the parmaeter.

- #### create

```
beneficiaryGroupClient.create
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

```
beneficiaryGroupClient.list
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

```
beneficiaryGroupClient.listByUUID
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

```
beneficiaryGroupClient.update

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

```
beneficiaryGroupClient.remove

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
