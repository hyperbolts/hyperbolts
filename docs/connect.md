# HyperBolts: Connecting to Sources
This is the core component of the HyperBolts system. It is here that the React rendering component and the data it needs are linked together.

`connect()` should be thought of as a connection to the application data storage, rather than a connection to the API that is being consumed. As such, it becomes clear how HyperBolts optimises API use by never requesting the same data more than once and rather sharing the existing endpoint data with all other components that have linked to it also.

## Syntax
```
connect(<sources>, <component>);
```

Where `<sources>` is an array of source definitions, and `<component>` is the React component that uses the `<sources>` to render content.

The starter code loads information from a simulated server API, and joins the data from each end point using hyperbolts configuration. This shows how multiple API end points can be automatically "flatterned" into a single dataset for use by your components.

## Usage
First, include the required libraries and standard boiler-plate code:

```
const Hyper = require('hyperbolts');
const React = require('react');

// Export the connected component
module.exports = Hyper.connect(

    // Define data sources
    [],
    
    // Define component
    class extends React.Component {
    
        // Render component
        render() {
            
        }
    }
)
```

Next define the sources that this component will use, in this example we use an API endpoint named `api/users.json` and we want to access this endpoint data in our component as `this.props.data.users`, so we've named it `'users'`:

```        
[
    {
        source: 'api/users.json',
        key:    'users'
    }
]
```

Now that the source has been linked, the data will be made available in the `this.props.data.users.values` property available in the component render method. Note that it is `...props.data.users...` because we named the source with the key `'users'`.

All that's left now is to output the data however you like! So, putting it all together, we'd output the number of users available from the end point as follows:

```
// Export the connected component
module.exports = Hyper.connect(

    // Define data sources
    [
        {
            source: 'api/users.json',
            key:    'users'
        }
    ],

    // Define component
    class extends React.Component {

        // Render component
        render() {
            const data = this.props.data.users.values || [];
            
            return (
                <div>
                    There are {data.length} users.
                </div>
            );
        }
    }
);
```
