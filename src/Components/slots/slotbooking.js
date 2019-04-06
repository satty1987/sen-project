import React, { Component } from "react";
import "./DoctorDescription.css";
import PropTypes from "prop-types";
import firebase from './firebase'
import "./SlotBooking.scss";
import 'bootstrap/dist/css/bootstrap.min.css';



class SlotBooking extends Component {

  
 
    constructor(props) {
    super(props);
    console.log('I am in SlotBooking')
    this.slotsDatabase=this.props.slotsDatabase;
    this.workingtime=this.props.workingtime;
    this.slotInterval=this.props.slotInterval;
    this.breaktime=this.props.breaktime;
    this.patient_booking=this.props.patient_booking;
    this.patientId=this.props.patientId;
    this.dateString=this.props.dateString;
    this.offsetTime=this.props.offsetTime;
   this.slotInterval=parseInt(this.slotInterval,10);   
    var arrayWorkingtime = this.workingtime.split(" ");
    var startHour = arrayWorkingtime[0].split(":")[0];
    var startMinute = arrayWorkingtime[0].split(":")[1];
    var endHour = arrayWorkingtime[2].split(":")[0];
    var endMinute = arrayWorkingtime[2].split(":")[1];
      this.breaktime=this.breaktime.split(",");
       this.breakArray = [];
    for (let i = 0; i < this.breaktime.length; i++) {
      let tempObj = this.breaktime[i].split(" ");
      this.breakArray.push({
        startHour: tempObj[0].split(":")[0],
        startMinute: tempObj[0].split(":")[1],
        endHour: tempObj[2].split(":")[0],
        endMinute: tempObj[2].split(":")[1]
      });
    }
     

    //rows is an Array which contains all the rows that are to be printed for slots
    this.rows = [];
    var currentHour=parseInt(startHour,10);
    var currentMinute=parseInt(startMinute,10);
    let tempvar=0;
    for (let i = 0; i < this.slotsDatabase.length; i++) {
        if(currentMinute>=60)
        {
            
            currentHour+=Math.floor(currentMinute/60);
            currentMinute=currentMinute%60;
        }
        var NextMoment=(parseInt(currentMinute,10)+60*parseInt(currentHour,10))+parseInt(this.slotInterval,10);
        var NextHour=Math.floor(NextMoment/60);
        var NextMinute=NextMoment%60;
        var isInBreak=this.checkIsInBreak(currentHour,currentMinute,NextHour,NextMinute);
        var alreadyBooked=(this.slotsDatabase[i]==1); //Check Here Might Cause Bug
        if(currentHour.toString().length<2)
        {
          currentHour='0'+currentHour.toString();
        }
        if(currentMinute.toString().length<2)
        {
          currentMinute='0'+currentMinute.toString();
        }
        if(NextHour.toString().length<2)
        {
          NextHour='0'+NextHour.toString();
        }
        if(NextMinute.toString().length<2)
        {
          NextMinute='0'+NextMinute.toString();
        }
        if(isInBreak || alreadyBooked)
        {
            //booked
            this.rows.push(<button key={i} type="button" className="btn btn-outline-danger" data-key={i} data-id="Booked" onClick={this.giveErrorPrompt}>{currentHour}:{currentMinute} - {NextHour}:{NextMinute}</button>);
            tempvar++;
            if(tempvar%3==0)
            {
              this.rows.push(<br></br>);
              this.rows.push(<br></br>);
            }  
        }
        else
        {
            //not booked
            this.rows.push(<button key={i} type="button" className="btn btn-outline-success" data-key={i} data-id="notBooked" data-value={currentHour+":"+currentMinute +" "+ NextHour+":"+NextMinute} onClick={this.bookThisSlot}>{currentHour}:{currentMinute} - {NextHour}:{NextMinute}</button>);
            tempvar++;
            if(tempvar%3==0)
            {
              this.rows.push(<br></br>);
              this.rows.push(<br></br>);
            }
        }
        currentHour=NextHour;
        currentMinute=NextMinute;
        currentHour=parseInt(currentHour,10);
        currentMinute=parseInt(currentMinute,10);
    }

    this.state = {
      slots:  this.slotsDatabase 
    };
  }

  /////// Function to give error prompt for selecting booked Slot ///////
  giveErrorPrompt = () =>
  {
    alert('You can\'t book this slot, It is not available for Booking');
  }

  static contextTypes = {
    router: PropTypes.object
}

  ////// Function to book the current slot selected By User///////
  bookThisSlot = (event)=>
  {
      //change color of button because it is clicked
      var target=event.target;
      var wantToBook=window.confirm('Are you Sure you want to book this appointment?');
      if(wantToBook)
      {
          var index=event.target.dataset.key;
          var timeofbook=event.target.dataset.value;
          console.log('hello world  time book is '+timeofbook)
          var newString=this.state.slots.substring(0,index)+'1'+this.state.slots.substring(parseInt(index,10)+1);
          this.patient_booking[index]=this.patientId;
          console.log(newString);
      this.setState({
        slots:newString
      },()=>{

        const clinic=firebase.database().ref('clinic').child('navkar12 gmail com').child("date").child(this.dateString);
       clinic.update({slot_string:this.state.slots});
       clinic.update({patient_booking:this.patient_booking}); //updates booking info

       //adding clinic details to patient's current appointment
        const patient=firebase.database().ref('patient').child(this.patientId).child("current_appointment");
        patient.once("value").then(snapshot=>{
        const val=snapshot.val();
          let max1=snapshot.child('max').val();
          if(!max1)
          max1=0;
          max1=parseInt(max1)+1;
          patient.child(max1).set({
            clinic:this.props.doctorName,
            date:this.dateString,
            slot_time:timeofbook,

          })
          patient.update({
            max:max1,
          })


       /*  this.clinicforupdate=val.clinic;
        this.dateforupdate=val.date;
        this.slot_numberforupdate=val.slot_number;
        //promise in firebase to modify only after reading full data
        console.log(this.clinicforupdate+"  "+this.dateforupdate+"  "+this.slot_numberforupdate);
        this.clinicforupdate=this.clinicforupdate+this.props.doctorName;
        this.dateforupdate=this.dateforupdate+this.dateString;
        this.slot_numberforupdate=this.slot_numberforupdate+""+index;
        patient.update({clinic:this.clinicforupdate});
        patient.update({date:this.dateforupdate});
        patient.update({slot_number:this.slot_numberforupdate+""+index});
        console.log(this.clinicforupdate+"  "+this.dateforupdate+"  "+this.slot_numberforupdate);*/

        });
   
        


       // ROUTE TO NEXT PAGE FROM HERE
      })
      }
  }

  

    ///// Function to check if current time is in Break or not//////
   checkIsInBreak = (currentHour,currentMinute,NextHour,NextMinute) => {

    var currentHourGlobal=currentHour;
    var currentMinuteGlobal=currentMinute;
    var normalizetime=60*currentHour+currentMinute;
    if(normalizetime<=this.offsetTime)
    {
      return true;
    }
    for(let j=0;j<this.breakArray.length;j++)
    {
        currentHour=currentHourGlobal;
        currentMinute=currentMinuteGlobal;
        var breakStartHour=parseInt(this.breakArray[j].startHour,10);
        var breakStartMinute=parseInt(this.breakArray[j].startMinute,10);
        var breakEndHour=parseInt(this.breakArray[j].endHour,10);
        var breakEndMinute=parseInt(this.breakArray[j].endMinute,10); 
        var minutesOfBreakStart=parseInt(breakStartMinute,10)+60*parseInt(breakStartHour,10);
        var minutesOfBreakEnd=parseInt(breakEndMinute,10)+60*parseInt(breakEndHour,10);
        for(let i=0;i<this.slotInterval-1;i++)
        {
            if(currentHour>NextHour || (currentHour==NextHour && currentMinute>=NextMinute))
            break;
            if(currentMinute>=60)
            {
                currentHour+=Math.floor(currentMinute/60);
                currentMinute=currentMinute%60;
            }
            var minuteOfCurrentMinute=parseInt(currentMinute,10)+60*parseInt(currentHour,10);
            currentMinute++;
            if(minuteOfCurrentMinute>=minutesOfBreakStart && minuteOfCurrentMinute<minutesOfBreakEnd)
                return true;
        }
    }
    return false;

  }

  render() {
    return (
      <div> 
        {/*  Props of doctorName and other doctor details  will be send by Parent Page */}
        <div >
          <h2 align="center">{this.props.doctorName}</h2>
          <p> Enter the specialities of Doctor here</p>
        </div>
        <text className="datestring">Slots for {this.dateString} </text>
        <br></br>
        <br></br>
        <div>
        {
          this.rows.map(row=>row)
        }
        </div>
        <button type="button" className="btn btn-outline-success">Booked</button>
        <button type="button" className="btn btn-outline-danger">Not Booked</button>
      </div>
    );
  }
}

export default SlotBooking;