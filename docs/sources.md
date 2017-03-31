# HyperBolts: Source Definitions
The source definition is very flexible and can be as simple or complicated as you like. This is the place what you tell HyperBolts just how you would like your data to be presented to the render method of your component.
 
## Usage
The simplest way to define sources, which will put the actual data into `this.props` itself and allow you to access the values with `this.props.data.values`:

```
[
    {
        source: 'api/endPoint.json' // Path to end point
    }
]
```

But if you prefer to name your data source `endPointData`, so that the actual data will be put into a new property of `this.props.data.endPointData` and can be accessed with `this.props.data.endPointData.values`:

```
[
    {
        source: 'api/endPoint.json', // Path to end point
        key:    'endPointData'       // Key to give the actual data in this.props
    }
]
```

And to define multiple data sources (you can define as many as you like by adding more definitions to the array):

```
[
    {
        source: 'api/endPoint.json', // Path to end point
        key:    'endPointData'       // Key to give the actual data in this.props
    },
    {
        source: 'api/secondEndPoint.json', // Path to end point
        key:    'secondEndPointData'       // Key to give the actual data in this.props
    }
]
```

## Defining data sources for computed API paths
It is also possible to use a function to define the source value that HyperBolts will use to get the data from the API. In this case, simply replace the entire definition with a function:

```
(uri, params, query) => {
    return [
        {
            source: 'api/endPoint.json?test=' + params.test,
            key:    'endPointData'      
        }
    ]
}
```

## Requires
Data sources can also require other data sources, this means that you can start to build relationships between your data sources - right in your data source definition.

So, if you want to use the data from an end point named `endPointData` in order to build more sources you would just require it with a `requires` property and define the sources with the `sources:` property:

```
[
    {
        source: 'api/endPoint.json', // Path to end point
        key:    'endPointData'       // Key to give the actual data in this.props
    },
    {
        requires: 'endPointData',
        sources: (endPointData) => {
            // use endPointData.values here
        }
    }
]
```

More so, if you need to require more than once data source, just make `requires` into an array and HyperBolts will pass the data into your `sources` function as parameters automatically:

```
[
    {
        source: 'api/endPoint.json',
        key:    'endPointData'
    },
    {
        source: 'api/secondEndPoint.json',
        key:    'secondEndPointData'
    },
    {
        requires: ['endPointData', 'secondEndpointData'],
        sources: (endPointData, secondEndPointData) => {
            // use endPointData.values and secondEndPointData.values here
        }
    }
]
```

## Defining related data
Using requires, you can now define related data and flatten multiple API calls to get the data into a single data set for use in your component.

If you have two endpoints, `api/users.json` and `api/users/<userId>.json`. The first one gives a list of users with their `userId` and `name` only. The second returns details about a specified user, and would include the user's `email`. 

We would like HyperBolts to build us a data set for our component that has `userId`, `name` and `email` for each user. And we can accomplish this by defining the data sources as follows:

```
// Define data sources
[
    {
        source: 'api/users.json',
        
        // Give this source a key to it appears in the render 
        // component data set in this.props.data.users - if you don't 
        // specify a key here, it will appear in this.props.data.
        key:    'users' 
    },
    {
        // This data source is dependant on the datasource with 
        // key 'users' - you can if you have multiple datasources 
        // you depend on, just use an array here 
        requires: 'users', 
        
        // The required datasources specified above are passed in 
        // as individual parameters to this function
        sources:  users => {

            // Set a new source for each user to get the 'user details'
            return users.values.map((user, i) => ({
            
                // Use the current user row's id value to build the 
                // 'user details' endpoint url
                source: `api/users/${user.id}.json`,
                
                // Give this a key
                key:    `users.values.${i}.details`
            }))
        }
    }
],
``` 

The data source values passed into the render component will now be available in this.props and will be:

```
this.props.data.users.values
...
[
    {
        id: 1,
        name: 'User name 1',
        details: {
          id: 1,
          ...
          <more fields>
          ...
          email: 'user@name.co.uk'
        }
    }
]
```
