#### Source

To use source sdk client we need retrive from the SDK using `rumsanService.client`

```
  const sourceclient =  getSourceClient(rumsanService.client);

```

As the mutation function or query function may contain some payload to be pass which are the parmaeter.

- #### create

```
sourceclient.create
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

```sourceclient.list

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

```
sourceclient.listById
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

```
sourceclient.update

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

```
sourceclient.remove

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

```
sourceclient.importIdMapping
```

| Parameter  | Type     |
| :--------- | :------- |
| `importId` | `string` |

| Response |
| :------- |

```
 success: true
```
