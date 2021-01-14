import React, {useEffect} from 'react';
import {NavBar, Footer} from './NavBar.js'
import {ListGroup, ListGroupItem, Spinner, Button, TabContent, TabPane, Nav, NavItem, NavLink, Form, FormGroup, Label, Input, FormText} from 'reactstrap';
import loading from './loading.webp'
import Posts from './Posts.js'

function RenderUsers({list}){
    return <ListGroup>
        {list.map((ele,i) => <ListGroupItem key={i}>{ele}</ListGroupItem>)}
    </ListGroup>
}

function RenderPosts(props){
    // useEffect(() => {console.log(props)});
    return(
        <React.Fragment>
            {props.state.delState}
            {!props.state.delState ?            
            <Button onClick={props.changeDelState} color="danger" style={{margin: "25px 0px 0px 25px"}}>Delete Posts</Button> : 
            <Button onClick={props.changeDelState} color="success" style={{margin: "25px 0px 0px 25px"}}>Cancel</Button>
            }
            {props.state.delState ? <Button onClick={props.deleteAll} color="danger" style={{margin: "25px 0px 0px 25px"}}>Delete All</Button> : null}
            {props.state.delState ? <h6 style={{margin : "10px"}}>Please select posts to delete</h6> : null}
            <Posts incDel={!props.state.delState} storedPids={props.state.delPosts} clickMethod={props.addDelPost} content={props.state.getPosts}></Posts>
        </React.Fragment>
    );
}

export default class User extends React.Component{
    constructor(props){
        super(props);
        this.state = {followReq : false, following : [], delPosts : [], netPosts : [], delState : false, activeTab : 1, getPosts : [], FormDesc : "", FormAccess : "Private", FormTitle : ""}
        this.toggle = this.toggle.bind(this);
        this.createPost = this.createPost.bind(this);
        this.changeDelState = this.changeDelState.bind(this);
        this.addDelPost = this.addDelPost.bind(this);
        this.deleteAll = this.deleteAll.bind(this);
    }

    deleteAll(){
        if(this.state.delPosts.length > 0){
            // console.log("SENDING: ", this.state.delPosts)
            fetch('/deletePosts', {
                method : "DELETE",
                headers : {
                    Authorization : "Bearer " + localStorage.getItem('token'),
                    'Content-Type' : "application/json"
                },
                body : JSON.stringify(this.state.delPosts)
            }).then(res => res.json()).then(res => {
                if(res.err)
                    alert(res.err)
                this.setState({delState : false, delPosts : []});
            })
        }
    }

    addDelPost(pid){ 
        if(this.state.delPosts.find(ele => ele === pid)) {
            this.setState((s,p) => {
                var temp = s.delPosts.filter(ele => ele !== pid)
                return {delPosts : temp};
            })
        } else {
            this.setState((s,p) => {
                var temp = [...s.delPosts];
                temp.push(pid);
                return {delPosts : temp};
            })
        }
    }

    changeDelState(){
        console.log('clicked');
        this.setState({delState : !this.state.delState})
    }

    createPost(e){
    e.preventDefault();
        fetch('/addPost', {
            method : "POST",
            headers : {
            Authorization : "Bearer " + localStorage.getItem('token'),
            'Content-Type' : 'application/json'
            }, 
            body : JSON.stringify({TITLE : this.state.FormTitle, _DESC : this.state.FormDesc, ACCESS : this.state.FormAccess})       
        }).then(res => res.json()).then(res => {
            console.log(res);
            if(res.err){
                alert(res.err);
            } else {
                var newstate = JSON.parse(JSON.stringify(this.state.getPosts));
                newstate.push(res.newPost);
                console.log(newstate);
                this.setState((s,p) => {
                    alert('state update');
                    return Object.assign(s,{getPost : newstate, activeTab : 1})
                });
            }
        })
    }

    getFollowing(){
        if(this.state.following.length  === 0){
            fetch('/getFollowing', {
                method : "GET",
                headers : {
                    Authorization : "Bearer " + localStorage.getItem('token')
                },
            }).then(res => res.json()).then(res => {
                // console.log(res);
                if(res.err){
                    alert(res.err);
                } else {
                    var uids = res.following.map(ele => ele['TOUID']);
                    // console.log(uids);
                    uids.forEach((uid,i) => {
                        if(i === uids.length - 1){
                            this.setState({followReq : true});
                        }
                        fetch('/getName/' + uid, {method : "GET"}).then(res => res.json()).then(res => {
                            // console.log(res);
                            this.setState((s,p) => {
                                var t = [...s.following]; 
                                t.push(res.name[0]['UNAME']);
                                return {following : t};
                            })
                            // res => {this.setState({userName : res.name[0]['UNAME']})}
                        }
                        )
                    })
                }
            })
        }
    }

    componentDidMount(){
        fetch('/user/posts', {
            method : "GET",
            headers : {
                Authorization : "Bearer " + localStorage.getItem('token')
            },
        }).then(res => res.json()).then(res => {
            this.setState({getPosts : res.posts, initReq : true});
        })
    }

    getAllPosts(){
        fetch('/netPosts', {
            method : "GET",
            headers : {
                Authorization : "Bearer " + localStorage.getItem('token')
            }
        }).then(res => res.json()).then(res => {
            this.setState({netPosts : res.posts});
        })
    }

    toggle(i){
        if(i === 2)
            this.getFollowing();
        if(i === 3)
            this.getAllPosts();
        this.setState({activeTab : i});
    }

    render(){
        return(
            <div className='body-wrap'>
                <NavBar/>
                    <Nav tabs>
                        <NavItem>
                            <NavLink style={{cursor : "pointer"}} onClick={() => {this.toggle(1)}} className={this.state.activeTab === 1 ? 'active' : undefined}>
                                Your Posts
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink style={{cursor : "pointer"}} onClick={() => {this.toggle(2)}} className={this.state.activeTab === 2 ? 'active' : undefined}>
                               People you follow
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink style={{cursor : "pointer"}} onClick={() => {this.toggle(3)}} className={this.state.activeTab === 3 ? 'active' : undefined}>
                                Posts from People you follow
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink style={{cursor : "pointer"}} onClick={() => {this.toggle(4)}} className={this.state.activeTab === 4 ? 'active' : undefined}>
                                Create Post
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId={1}>
                            {this.state.getPosts.length === 0 ? 
                            this.state.initReq ? <p>No Posts Found! </p> : <Spinner style={{margin:"30px"}}color='primary'/> : <RenderPosts {...this}/>}
                        </TabPane>
                        <TabPane tabId={2}>
                            {this.state.following ? <RenderUsers list={this.state.following}/> : (this.state.followReq ? <p>You Don't follow anyone!</p> : <Spinner style={{margin:"30px"}}color='primary'/>)}
                        </TabPane>
                        <TabPane tabId={3}>
                        {this.state.following ? <Posts content={this.state.netPosts}/> : <Spinner style={{margin:"30px"}}color='primary'/>}
                        </TabPane>
                        <TabPane tabId={4}>
                            <div style={{maxWidth : "50%", marginLeft : "50px"}}>
                                <Form style={{backgroundColor : "white", margin : "10px", padding : "10px", borderRadius : "5px"}}>
                                    <FormGroup>
                                        <Label for="access">Select an Access Type</Label>
                                        <Input value={this.state.FormAccess} onChange={(e) => {this.setState({FormAccess : e.target.value})}} type="select" name="access" id="access">
                                            <option>Private</option>
                                            <option>Public</option>
                                        </Input>
                                        <FormText>Note: Public Notes are visible globally, whereas Private Notes are only visible to you.</FormText>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="title">Title</Label>
                                        <Input value={this.state.FormTitle} onChange={(e) => {this.setState({FormTitle : e.target.value})}} type="text" name="title" id="_title" placeholder="Please insert your title here" />
                                        <FormText>Note: Your Post Title can be at most 20 characters.</FormText>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="_desc">Description</Label>
                                        <Input value={this.state.FormDesc} onChange={(e) => {this.setState({FormDesc : e.target.value})}} type="text" name="desc" id="_desc" placeholder="Please insert your description here" />
                                        <FormText>Note: Your Post Description can be at most 140 characters.</FormText>
                                    </FormGroup>
                                    <Button onClick={this.createPost}>Submit</Button>
                                </Form>
                            </div>
                        </TabPane>
                    </TabContent>
                <Footer/>
            </div>
        );
    }
};