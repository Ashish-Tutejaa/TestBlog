import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {Button} from 'reactstrap';

export default class LoginPage extends React.Component
{
    constructor(props){
        super(props);
        this.state = {
        email : "",
        username : "",
        password : "",
        auth : (localStorage.getItem('token') ? true : false)
        };
    this.handleRegister = this.handleRegister.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    }

    handleRegister(){
        fetch('/registerUser',{
        method : "POST",
        headers : {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify({email : this.state.email, uname : this.state.username, pass : this.state.password})
        }).then(res => res.json()).then(res => {
        //res should have token.
            console.log(res);
            alert(res);
            if(res.err){
                alert(res.err);
            } else if(res.token) {
                alert(res.token);
                console.log(res.token);
                this.setState((s,p) => {
                    return Object.assign(s,{auth : true});
                }, () => {
                    localStorage.setItem('token',JSON.stringify(res.token));
                });
            }
        });
    }

    handleLogin(){
        fetch('/loginUser',{
            method : "POST",
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({email : this.state.email, uname : this.state.username, pass : this.state.password})
            }).then(res => res.json()).then(res => {
            //res should have token.
                if(res.err){
                    alert(res.err);
                } else if(res.token) {
                    console.log(res.token);
                    localStorage.setItem('token',JSON.stringify(res.token));
                    this.setState({auth : true});
                }
            });
    }

    render(){
        if(this.state.auth){
            return (
                    <div>
                        <h1 style={{margin : '10px'}}>Login Successful!</h1>
                        <br/>
                        <Link to='/user'>
                            <Button style={{margin : '10px'}} color='success'>Home</Button>
                        </Link>
                    </div>
            );
        } else {
            return(
                <div className='body-login'>
                    <div className="form">
                        <form onSubmit={(e) => {e.preventDefault()}}>
                            <h1>Login/Signup</h1>
                            <div className="fields">
                                <div className="input-grp">
                                    <input onChange ={(e) => {this.setState({email : e.target.value})}} value = {this.state.email} type="email" placeholder="Email" autoComplete="nope"/>
                                </div>
                                <div className="input-grp">
                                    <input onChange ={(e) => {this.setState({username : e.target.value})}} value = {this.state.username} type="text" placeholder="Username" autoComplete="new-username"/>
                                </div>
                                <div className="input-grp">
                                    <input onChange ={(e) => {this.setState({password : e.target.value})}} value = {this.state.password} type="password" placeholder="Password" autoComplete="new-password"/>
                                </div>
                            </div>
                            <div className="buttons">
                                <button onClick={this.handleRegister}>Register</button>
                                <button onClick={this.handleLogin}>Sign in</button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }

    }
}
