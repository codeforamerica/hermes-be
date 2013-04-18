# REST API

## Base URIs
   * Development: `http://localhost:8080/`

## Resources

### Templates

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
