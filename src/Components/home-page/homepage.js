import React from 'react';
import NavigationBar from '../navigationbar';
import  List from './List';
import firebase from '../../config/configuration';
import _ from 'lodash';
import Datalist from './datalist';
import Slotbook from '../slots/slotbooking';
import {BrowserRouter as Router, Redirect, Route, Switch,Link} from "react-router-dom";
import AuthorizedComponent from '../AuthorizedComponent';
class Home extends React.Component{
    constructor(props){
        super(props);
        this.state={
            cliniclist:[],
            iscurrappoitmentopen :false,
            isrevisappoitmentopen :false

        }
        this.opencurrapp = this.opencurrapp.bind(this);
    }
    componentDidMount(){
        this.getclinic();
    }

    getclinic=()=>{
        let clinicsref=firebase.database().ref('/clinic').orderByKey();
        clinicsref.on("value",snapshot=>{
           
            this.setState({
                cliniclist : snapshot.val()
            },()=>{
                console.log(this.state);
            })
                     
        })  
    }
    opencurrapp=()=>{
        console.log('open currappoitment ');
        this.setState({
            iscurrappoitmentopen: !this.state.iscurrappoitmentopen
        });
    }
    openrevisapp=()=>{
        console.log('open currappoitment ');
        this.setState({
            isrevisappoitmentopen: !this.state.isrevisappoitmentopen
        });
    }
    render(){
        const {user}=this.props;
        console.log('home-page i am '+user);
        return(

            <React.Fragment>
                <NavigationBar/>
                <h1>Thsi is home page</h1>
                <Link to={'/currappoitment'}>
                    <button className="btn btn-outline-dark btn-lg">
                        <span className="mr-2">Current Appoitment</span>
                        <i className="fa fa-angle-right"></i>
                    </button>
                </Link>
                <Link to={'/reviappoitment'}>
                    <button className="btn btn-outline-dark btn-lg">
                        <span className="mr-2">Revisit Appoitment</span>
                        <i className="fa fa-angle-right"></i>
                    </button>
                </Link> 
                
                {/* <buttton className='btn btn-outline-dark btn-lg' type='button' onClick={this.opencurrapp}>
                {this.state.iscurrappoitmentopen ? 'close current appointment' : 'open current appointment '}</buttton>
                <buttton className='btn btn-outline-dark btn-lg' type='button' onClick={this.openrevisapp}>
                {this.state.isrevisappoitmentopen ? 'close revisit appointment' : 'open revisit appointment '}</buttton>
                {
                    this.state.iscurrappoitmentopen === true ?
                   <div className='jumbotron text -center'> 
                    <div className='container'>
                    <h2 className='page-header'>
                    print current appoitment 
                    </h2>
                    </div> 
                   </div>
                    : ''
                }

            
                {
                    this.state.isrevisappoitmentopen === true ?
                   <div className='jumbotron text -center'> 
                    <div className='container'>
                    <h2 className='page-header'>
                    print revisit appoitment 
                    </h2>
                    </div> 
                   </div>
                    : ''
                } */}
                
                <AuthorizedComponent   data={this.state.cliniclist}  permission={(this.props.user === 'patient') ? true : false }
                 component={Datalist}  user={this.props.user} />       
                             

            </React.Fragment>

           


        )
    }
}

export default Home;