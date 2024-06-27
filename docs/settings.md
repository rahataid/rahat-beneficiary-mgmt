#### SETTINGS CLIENT

To use setting sdk client we need retrive from the SDK using `rumsanService.client`

```
const settingClient = getSettingsClient(rumsanService.client);

```

As the mutation function or query function may contain some payload to be pass which are the parmaeter.

- #### Create Settings

```
settingClient.create
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

```
settingClient.list
```

| Response |
| :------- |

```
  sucess: boolean
  data: any
```
