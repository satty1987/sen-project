import {Redirect, Route, withRouter} from "react-router-dom";
import React from "react";

const AuthorizedRoute = ({component: Component,  permission,...rest}) => {
    console.log('i am in AuthorizedRoute   '+ permission);
    return (<Route
        {...rest}
        render={props =>
            permission ? (
                <Component {...props} {...rest}/>
            ) : (
                <Redirect to={{
                    pathname:rest.location.pathname,
                    state: rest.location.pathname
                }}/>
            )
        }
    />)
}

export default withRouter(AuthorizedRoute)
