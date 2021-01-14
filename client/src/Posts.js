import {Card, CardTitle, CardText, Button} from 'reactstrap';
import {Link} from 'react-router-dom';

function MakeUser({id,name}){
    var route = `/userProfile/${id}`;
    return (<Link to={route}>
        <span style={{color : "gray", fontSize : '15px'}}>by {name}</span>
    </Link>);
}

export default function Posts({content,incDel,clickMethod,storedPids})
{
    if(!incDel && !storedPids && clickMethod === undefined){
        return content.map(ele => {
            return (
                <Card body outline color="primary" key={ele.PID}>
                    <CardTitle tag="h6">{ele.TITLE} {<MakeUser name={ele.UNAME} id={ele.UID}/>}</CardTitle>
                    <CardText>{ele._DESC}</CardText>
                </Card>
            )
        })
    } else if(incDel){
        return content.map(ele => {
            return (
                <Card body outline color ="primary" key={ele.PID}>
                    <CardTitle tag="h6">{ele.TITLE } {<MakeUser name={ele.UNAME} id={ele.UID}/>}</CardTitle>
                    <CardText>{ele._DESC}</CardText>
                </Card>
            );
        })
    } else {
        return content.map(ele => {
            if(storedPids.find(element => ele.PID === element)){
                return (
                    <Card body inverse color="danger" key={ele.PID} onClick={() => {clickMethod(ele.PID)}}>
                        <CardTitle tag="h6">{ele.TITLE } {<MakeUser name={ele.UNAME} id={ele.UID}/>}</CardTitle>
                        <CardText>{ele._DESC}</CardText>
                    </Card>
                )
            } else {
                return (
                    <Card body outline color="primary" key={ele.PID} onClick={() => {clickMethod(ele.PID)}}>
                        <CardTitle tag="h6">{ele.TITLE } {<MakeUser name={ele.UNAME} id={ele.UID}/>}</CardTitle>
                        <CardText>{ele._DESC}</CardText>
                    </Card>
                )
            }
        })
    }
}