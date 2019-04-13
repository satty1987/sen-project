import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Spinner } from "reactstrap";
//import "./Clin.css";
import FileUploader from "react-firebase-file-uploader";
import firebase from "../../config/configuration";
import FlipMove from "react-flip-move";
import ProgressBar from "react-bootstrap/ProgressBar";
import {Input} from "reactstrap";
import {Link} from 'react-router-dom';

class Clinic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bld: "",
      appointments: [],
      isloading: false,
      progress: 0,
      current:''
    };
  }

  //calculates slot time from starting time
  calculateslottime = (starthour, startminit, slottime, slotnumber) => {
    let hour = parseInt(starthour);
    let minit = parseInt(startminit);
    let slttime = parseInt(slottime);
    let sltnumber = parseInt(slotnumber);
    let totalminit = parseInt(hour * 60 + minit + slttime * sltnumber);
    // console.log(typeof starthour+' '+typeof startminit+'z'+slttime+' '+sltnumber+typeof sltnumber);
    let newhour = parseInt(totalminit / 60);
    let newminit = parseInt(totalminit % 60);

    let ans = "";
    if (newhour < 10) ans = ans + "0";
    ans = ans + newhour;
    ans = ans + ":";
    if (newminit < 10) ans = ans + "0";
    ans = ans + newminit;
    // console.log(ans) ;
    return [ans, totalminit];
  };

  //file change handler
  fileChangedHandler = event => {
    const file1 = event.target.files[0];
    console.log(file1);
    let index = this.state.appointments.findIndex(function(element) {
      return element.id == event.target.id;
    });
    let temparr = this.state.appointments;
    temparr[index].file = file1;
    this.setState({
      appointments: temparr
    },()=>{console.log('filechangehandler'+this.state.appointments[index].file)});
  };

  //description handler
  descriptionhandler = event => {
    let index = this.state.appointments.findIndex(function(element) {
      return element.id == event.target.id;
    });
    const description1 = event.target.value;
    let temparr = this.state.appointments;
    temparr[index].description = description1;
    this.setState({
      appointments: temparr
    });
  };

  //start uploading file in firebase
  handleUploadStart = (filename, task) => {};

  //handle progress of file uploading
  handleProgress = snapshot => {
    let progress1 = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
    this.setState({
      progress: progress1
    });
    console.log('Upload is ' + progress1 + '% done');
  };

  //handle file upload error in file uploading
  handleUploadError = error => {
    let index = this.state.current;
    let temparr = this.state.appointments;
    temparr[index].showprogressbar = false;
    this.setState({
      appointment: temparr,
      current: '',
      progress: 0
    });
    alert(error);
    console.error(error);
  };

  //handle upload success in file uploading
  handleUploadSuccess = filename => {
    let index=this.state.current;
    let temparr=this.state.appointments;
    temparr[index].fileuploaded=true;
    temparr[index].showprogressbar=false;
    this.setState({
      appointments:temparr,
      current:'',
      progress: 0
    });
    console.log(temparr[index].file);
    alert("file succesfully uploaded");
  };

  //file is uploaded to firebase
  fileuploadhandler = (event) => {
    event.preventDefault();
    let index = this.state.appointments.findIndex(function (element) {
      return element.id == event.target.id;
    });
    if(this.state.appointments[index].file=='')
    {
      alert("Upload prescription file");
    }
    else
    {
    let temparr=this.state.appointments;
    temparr[index].showprogressbar=true;
    this.setState({
      progress:0,
      appointments:temparr,
      current:index
    })
    console.log('filename'+temparr[index].file);
    let uploadTask = firebase.storage().ref(event.target.id).put(temparr[index].file);
    uploadTask.on("state_changed",this.handleProgress,this.handleUploadError,this.handleUploadSuccess);
  }

  };

  //delete appointment from firebase
  deletehandler = id => {
    // console.log(event.target.name)
    let temparr=this.state.appointments;
    let index = this.state.appointments.findIndex(function (element) {
      return element.id == id;
    });
    temparr.splice(index, 1);
    this.setState(prevState => {
      prevState["appointments"] = temparr;
      return prevState;
    });
    alert('patient succesfully checked out');

  };

  //redirect to prescription page
  historyhandler = () => {
    
  };

  uploadhandler = event => {
    event.preventDefault();
    let clinic1 = this.props.clinic;
    let patient = event.target.id;
    let filename1 = this.state.file;
    let description1 = this.state.description;
    firebase
      .database()
      .ref("storage")
      .child(patient)
      .once("value")
      .then(snapshot => {
        let max1 = snapshot.child("max").val();
        if (!max1) max1 = 0;
        max1 = parseInt(max1) + 1;
        firebase
          .database()
          .ref("storage")
          .child(patient)
          .child(max1)
          .set({
            clinic: clinic1,
            filename: filename1,
            description: description1
          });

        firebase
          .database()
          .ref("storage")
          .child(patient)
          .update({
            max: max1
          });
      });
    alert("visit completed");
  };

  //state change handler
  handler = event => {
    const { name, value } = event.target;
    this.setState(prevState => {
      prevState = JSON.parse(JSON.stringify(this.state));
      prevState[name] = value;
      //console.log(prevState);
      return prevState;
    });
  };

  //fetch data from firebase
  fetchData = (date, clinic) => {
    var patientdata = [];
    this.setState(prevState => {
      prevState["isloading"] = true;
      return prevState;
    });
    var today = date;
    console.log(today);
    var arr1 = [],
      arr2 = [];
    var clinicname = clinic;
    var starthour, startminit, slottime;
    var flag = 0;

    firebase
      .database()
      .ref("clinic")
      .child(clinicname)
      .once("value")
      .then(snapshot => {
        var a = snapshot.val();
        var workingarray = a.workingtime.split(" ");
        var hourandminit = workingarray[0].split(":");
        starthour = hourandminit[0];
        startminit = hourandminit[1];
        slottime = a.slot_time;
      })
      .then(() => {
        let data = firebase
          .database()
          .ref("clinic")
          .child(clinicname)
          .child("date")
          .child(today)
          .once("value")
          .then(snapshot => {
            //console.log(snapshot.val());
            if (
              snapshot.val() == null ||
              snapshot.hasChild("patient_booking") == false
            ) {
              this.setState({
                isloading: false
              });
            } else {
              firebase
                .database()
                .ref("clinic")
                .child(clinicname)
                .child("date")
                .child(today)
                .child("patient_booking")
                .once("value")
                .then(snapshot => {
                  var a = snapshot.val();
                  // console.log('in patient');
                  for (var i = 0; i < 40; i++) {
                    if (a[i]) {
                      arr1.push(a[i]);
                      arr2.push(i);
                    }
                  }

                  for (var i = 0; i < arr1.length; i++) {
                    let j1 = arr2[i];
                    let j2 = arr1[i];
                    firebase
                      .database()
                      .ref("patient")
                      .child(arr1[i])
                      .once("value")
                      .then(snapshot => {
                        var a = snapshot.val();
                        let arrayofslottime = this.calculateslottime(
                          starthour,
                          startminit,
                          slottime,
                          j1
                        );
                        let slotttime = arrayofslottime[0];
                        let totalminit = arrayofslottime[1];

                        patientdata.push({
                          name: a.name,
                          slottime: slotttime,
                          totalminit: totalminit,
                          gender: a.gender,
                          age: a.age,
                          id: j2,
                          file: "",
                          fileuploaded: false,
                          showprogressbar:false
                        });
                      })
                      .then(() => {
                        flag = flag + 1;
                        let f1 = true;
                        f1 = false;

                        patientdata.sort(function(a, b) {
                          return a.totalminit - b.totalminit;
                        });

                        this.setState(prevState => {
                          prevState["appointments"] = patientdata;
                          prevState["isloading"] = f1;
                          return prevState;
                        });
                      });
                  }
                });
            }
          });
      });
  };

  //componentdid update for checking changed props in parent
  componentDidUpdate = props => {
    let refresh = this.props.refresh;
    let date = this.props.date;
    let clinic = this.props.clinic;

    if (refresh != props.refresh) {
      // console.log("did update  " + refresh + "  " + date);
      //console.log("appointments prev " + this.state.appointments.length)
      this.setState({ appointments: [] });
      this.fetchData(date, clinic);
    }
  };

  //component did mount
  componentDidMount = () => {
    // console.log("did mount:" + this.props.date + "  " + this.props.refresh);
    this.fetchData(this.props.date, this.props.clinic);
  };

  //checkout handler
  checkouthandler=(event)=>{
    event.preventDefault();
    let index = this.state.appointments.findIndex(function (element) {
      return element.id == event.target.id;
    });
    if(this.state.appointments[index].fileuploaded==false || this.state.appointments[index].description=='')
    {
      alert("please enter description and upload prescription file");
    }
    else
    {
        this.deletehandler(event.target.id);
    }
  }

  render() {
    let index=-1;
    var NewAppointment = this.state.appointments.map(appointment => {
      index++;
      let pbar = <div />;
      if(this.state.current===index)
      pbar = (<ProgressBar
        animated
        varient="success"
        label={this.state.progress}
        now={this.state.progress}
      /> 
      );

      return (
        <div href="#" className="list-group-item ">
          <h4 className="list-group-item-heading"> {appointment.name} </h4>
          <p className="list-group-item-text">
            slottime: {appointment.slottime}
          </p>
          <p className="list-group-item-text"> gender: {appointment.gender} </p>
          <p className="list-group-item-text"> age: {appointment.age} </p>

          <label> Description: </label>
          <Input
            type="text"
            placeholder="Description"
            required
            id={appointment.id}
            onChange={this.descriptionhandler}
          />

          <label> Prescription File: &nbsp; &nbsp; &nbsp; </label>
          <form inline onSubmit={this.fileuploadhandler} id={appointment.id}>
            <input
              type="file"
              id={appointment.id}
              required
              onChange={this.fileChangedHandler}
            />
            <button className="upload" disabled={this.state.current==''?false:true}>Upload</button>
          </form>
          {pbar}
          <button className="delete" onClick={this.checkouthandler} id={appointment.id}>CheckOut</button>
          {/* <button className="history" onClick={this.historyhandler} id={appointment.id}> History </button> */}
           <Link to={`/prescription/${appointment.id}`} >
               <button className="btn btn" style={{borderRadius:'5%',height:"90%",borderEndStartRadius:'5%',backgroundColor:"#5680E9"}}>See History</button>
           </Link>
        </div>
      );
      
    });

    if (this.state.isloading) {
      return (
        <div>
          <Spinner color="primary" />
        </div>
      );
    }

    return (
      <div>
        <div className="list-group">
          <FlipMove duration={500} easing="cubic-bezier(0,0,1,1)">
            {NewAppointment}
          </FlipMove>
        </div>
      </div>
    );
  }
}

export default Clinic;