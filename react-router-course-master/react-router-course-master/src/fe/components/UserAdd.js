import React from 'react';
import axios, { post } from 'axios';
import UserForm from './UserForm';
import { Helmet } from 'react-helmet';
import Page from './Page';

class UserAdd extends React.Component {
    constructor(props) {
        super(props);

        this.state = { user: {}, userId:'',username:'', reservationId:'' };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    componentDidMount() {
        const { match: { params } } = this.props;
        this.setState({username:params.username, userId: params.userId}, ()=>{
            const spectator = {
                "Pagination":{
                    "Take":1
                },
                "Filtering":{
                    "SearchTerm":params.username
                }
            }
            console.log(spectator);
            axios.post('http://localhost:5000/User/get', spectator)
                .then(({ data:u }) => {
                    const response = u["item2"][0];
                    console.log(response);
                    this.setState({user:response});
                })
        });
    }

    handleSubmit(user, seatReserved) {
        const { username } = this.state;
        console.log(seatReserved);

        seatReserved.map((seat)=>{
            let result = {
                "id": seat.id,
                "name": seat.name,
                "state": 3,
                "userId": user.id
            }
            axios.put('http://localhost:5000/Book', result)
                .then(({ data:u }) => {

                        console.log('updated:', user);

                    });
            this.setState({ user });

            console.log('updated:', user);
            const { history } = this.props;

            history.push(`/library/${username}`);

        });

    }

    handleCancel(e) {
        e.preventDefault();
        const { username } = this.state;

        console.log('you have canceled');
        const {history} = this.props;
        history.push(`/library/${username}`);
    }


    render() {
      const {username,user} = this.state;
    return (
      <Page title="" columns={3}>
        <Helmet>
          <title></title>
        </Helmet>
        <UserForm
            user={user}
          handleSubmit={this.handleSubmit}
          handleCancel={this.handleCancel}
        />
      </Page>
    );
  }
}

export default UserAdd;
