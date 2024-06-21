#### Beneficiary Source

To use beneficiarySource sdk client we need retrive from the SDK using `rumsanService.client`

```
  const beneficiarySourceclient =  getBeneficiarySourcesClient(rumsanService.client);

```

As the mutation function or query function may contain some payload to be pass which are the parmaeter.

- #### create

```
beneficiarySourceclient.create
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

```
 beneficiarySourceclient.list

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

```beneficiarySourceclient.listById

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

```
beneficiarySourceclient.update

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

```
beneficiarySourceclient.remove

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
