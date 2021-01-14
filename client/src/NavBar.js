import {Link,Redirect} from 'react-router-dom';

function Flip({logstate}){
    var text = logstate ? "Logout" : "Login";
    if(logstate){
        return(<div className='logSys'>
                <Link onClick={() => {localStorage.removeItem('token')}} to='/global' style={{textDecoration:"none"}}>
                    {text}
                </Link>
            </div>)
    } else {
        return (
            <div className='logSys'>
                <Link to='/login' style={{textDecoration:"none"}}>
                    {text}
                </Link>
            </div>
        );
    }
}

export function NavBar(){

    var loginState = false
    if(localStorage.getItem('token'))
        loginState = true;
    var headerText = (loginState ? `Home` : "Public Posts");

    return (
        <div className='navbar'>
            <h1>{headerText}</h1>
            <Flip logstate={loginState}/>
        </div>
    );
}

export function Footer(props){
    return(
        <div className='Footer'></div>
    );
}