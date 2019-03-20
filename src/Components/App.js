import React,{Component} from 'react';
import Publicpage from './public-page/PublicPage';
// import SendProps from './SendProps';
// import SlotBooking from './SlotBooking'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css'
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import AuthorizedRoute from './AuthorizedRoute';
import Home from './home-page/homepage';
import Slotbook from './slots/slotbooking';
import Currappo from './appoitment-page/currappo';
export const Context = React.createContext();

class App extends Component{
    constructor(props){
        super(props);
        this.state={
            isAuthenticated: true,
            user:'patient'
            //user: patient or clinic 
        }

    }
    login=()=>{

    }

    logout=()=>{

    }
    
  
    render(){
        const {isAuthenticated}=this.state;
        console.log(isAuthenticated);
        if(isAuthenticated){
            document.body.style.background = "#ffffff";
        }
        else{
        var urlString = 'url(' + require('../images/publicpage2.jpg') + ')'; 
        //urlString.style.width=100;
        document.body.style.background = urlString;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPositionY= "-50px";
        document.body.style.backgroundRepeat = "no-repeat";
        }
    
        return(
            <Context.Provider value={
                {
                    user:this.state.user
                }
            }>

            
            <Router>
                <React.Fragment>
                    <Switch>
                    {/* <Publicpage /> */}
                    <AuthorizedRoute permission={true}  path="/" exact strict
                        component={isAuthenticated ? Home : Publicpage }
                        user={this.state.user} />
                   
                    <AuthorizedRoute permission={this.state.user === 'patient' ? true : false }  path="/slotbook" exact strict 
                        component={Slotbook}/>
                    <AuthorizedRoute permission={this.state.user === 'patient' ? true : false } path="/currappoitment" exact strict 
                        component={Currappo} />
                   
                    {/* <Route render={() => <Redirect to='/'/>}/> */}
                    </Switch>
                </React.Fragment>
             
            </Router>
            </Context.Provider>
            
             //<SendProps doctorName="Parth Patel"/>
        );
    }
}

export default App;