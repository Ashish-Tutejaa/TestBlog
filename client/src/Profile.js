import React from 'react';
import {Spinner, Button, Jumbotron} from 'reactstrap';
import Posts from './Posts.js'

export default class Profile extends React.Component{

    constructor(props){
        super(props);
        this.state = {auth : false, userName : "Loading...", followStatus : false};
        this.Follow = this.Follow.bind(this);
    }

    Follow(){
        fetch('/doesFollow/' + this.props.match.params.uIdent + '/toggle', {method : "GET",
        headers : {
            Authorization : "Bearer " + localStorage.getItem('token')
        }
        }).then(res => res.json()).then(
            res => {
                console.log(res);
                if(res.success)
                    this.setState({followStatus : !this.state.followStatus});
                else if(res.err)
                    alert(res.err);
            }
        )
    }

    componentDidMount(){
        console.log(this.props.match.params);

        if(localStorage.getItem('token'))
            {
                // this.setState({auth : true});
                this.setState((s,p) => {
                return {auth : true}
                }, () => {
                    fetch('/doesFollow/' + this.props.match.params.uIdent, {method : "GET",
                    headers : {
                        Authorization : "Bearer " + localStorage.getItem('token')
                    }
                }).then(res => res.json()).then(
                        res => {
                            console.log(res);
                            this.setState({followStatus : res.follow});
                        }
                    )
                })
            }

        fetch('/getName/' + this.props.match.params.uIdent, {method : "GET"}).then(res => res.json()).then(
            res => {this.setState({userName : res.name[0]['UNAME']})}
        )

        fetch('/getPublicPosts/' + this.props.match.params.uIdent, {
            method : "GET"
        }).then(res => res.json()).then(res => {this.setState({PublicPosts : res})})
    }

    render(){
        return (
            <>
                <Jumbotron style={{maxHeight : this.state.auth ? "200px" : "150px", paddingTop : this.state.auth ? "50px" : "10px"}}>
                    <h1>{this.state.userName}</h1>
                    {this.state.auth ? <Button onClick={this.Follow} size="sm" color="primary">{this.state.followStatus ? "Unfollow" : "Follow"}</Button> : null}
                </Jumbotron>
                {this.state.PublicPosts ? <Posts content ={this.state.PublicPosts}/> : <Spinner style={{margin:"30px"}}color='primary'/>}
            </>
        );
    }
} 