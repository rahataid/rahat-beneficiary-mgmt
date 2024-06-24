#### Field Definition

To use field definition sdk client we need retrive from the SDK using `rumsanService.client`

```
 const fieldDefClient = getFieldDefinitionClient(rumsanService.client);

```

As the mutation function or query function may contain some payload to be pass which are the parmaeter.

- #### Create

```
fieldDefClient.create
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

```
fieldDefClient.list
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

```
fieldDefClient.listById
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

```
fieldDefClient.listActive
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

```
fieldDefClient.update
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

```
fieldDefClient.toggleStatus
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

```
fieldDefClient.addBulks
```

| Parameter | Type  |
| :-------- | :---- |
| `file`    | `any` |

| Response |
| :------- |

```
 success: true
```
