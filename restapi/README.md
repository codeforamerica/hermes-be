# REST API

## Base URIs
   * Development: `http://localhost:8080/`

## Resources

### Templates

#### To retrieve a list of all available templates

##### Request
    GET {base-uri}/v1/templates

##### Response (success)

    200 OK
    
    {
      "templates":{
        "resp-err-internal-error":{
          "_links":{
            "self":"http://localhost:8080/v1/template/resp-err-internal-error"
          }
        },
        "resp-err-unknown-message":{
          "_links":{
            "self":"http://localhost:8080/v1/template/resp-err-unknown-message"
          }
        },
        "resp-ok-case-subscription-confirmed":{
          "_links":{
            "self":"http://localhost:8080/v1/template/resp-ok-case-subscription-confirmed"
          }
        },
        "resp-ok-confirm-case-subscription":{
          "_links":{
            "self":"http://localhost:8080/v1/template/resp-ok-confirm-case-subscription"
          }
        },
        "resp-ok-unsubscribed-from-case":{
          "_links":{
            "self":"http://localhost:8080/v1/template/resp-ok-unsubscribed-from-case"
          }
        }
      }
    }
    
### Template

#### To retrieve the raw text of a template

##### Request
    GET {base-uri}/v1/template/{id}

##### Response (success)

    200 OK

    "This is a test template with a variable here: {{someVariable}}"

#### To retrieve a rendered template given replacements

##### Request
    POST {base-uri}/v1/template/{id}

    {
      "someVariable": "foobar"
    }

##### Response (success)

    200 OK

    "This is a test template with a variable here: foobar"

### Case Subscribers

#### To create a new case subscriber

##### Request
    POST {base-uri}/v1/case/13-T-000001/subscribers

    {
      "cellNumber": "1111111111",
      "subscriptionDateTime": "2013-04-24T15:30:49.761Z"
    }

###### Notes
* **IMPORTANT!** The `cellNumber` specified in the request body will receive an SMS about their subscription. So please be aware of the number you use there. It is recommended you **use your own number when testing**.
* The case number specified in the URI will be normalized.
* The `cellNumber` specified in the request body will be normalized. If a 7-digit number is specified, a default area code will be prefixed. This default area code is specified by the configuration key `misc.cellPhoneAreaCode` (defined in [these configuration files](https://github.com/codeforamerica/hermes-be/tree/master/config)).
* The `subscriptionDateTime` specified in the request body is optional; default = date/time on server when request is received. If specified, please use the ISO8601 format as shown in the example request above.

##### Response (success)

    201 Created

    "Subscription created"
