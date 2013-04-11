# REST API

## Resources

### Case Contacts

#### To create a new case contact

##### Request
    POST {base-uri}/v1/case-contacts

    {
      "case_number": "13-C-23456677",
      "cellphone_number": "513246984"
    }

##### Response (success)

    201 Created

    {
      "meta": {
        "links": {
          "self": "http://{base-uri}/v1/case-contact/41923"
        }
      }
    }
