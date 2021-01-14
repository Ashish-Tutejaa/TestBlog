import React from 'react';
import {NavBar, Footer} from './NavBar.js';
import Posts from './Posts.js';

class Global extends React.Component
{
constructor(props)
    {
    super(props)
    this.state = {};
    }

componentDidMount()
    {
        fetch('/getPublicPosts', {method : "GET"}).then(res => res.json()).then((res) => {
            console.log(res);
            this.setState({publicPosts : res});
        })
    }

render()
    {
        return (
            <React.Fragment>
                <div className='body-wrap'>
                    <NavBar/>
                    {this.state.publicPosts ? <Posts content={this.state.publicPosts}/> : null}
                    <Footer/>
                </div>
            </React.Fragment>
        );
    }
}

export default Global;