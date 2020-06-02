import React from 'react';
import {Button, Form, Icon, Menu, Table} from 'semantic-ui-react';
import {Prompt} from 'react-router-dom';
import Seats from "./DrawGrid";
import seats from "../../../seats.json";
import DrawGrid from "./DrawGrid";
import {Popup} from 'semantic-ui-react';
import '../index.css';
import axios from "axios";
import regeneratorRuntime from "regenerator-runtime";
import times from "lodash.times";
const TOTAL_PER_PAGE = 10;


class UserForm extends React.Component {
    constructor(props) {
        super(props);

        const {user = {}} = props;

        this.state = {
            user,
            formChanged: false,
            seat: [],
            seatAvailable: [],
            seatReserved: [], tickets: [],

            page: 0,
            totalPages: 0,
        };

        this.onClickData = this.onClickData.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.getSoldTickets = this.getSoldTickets.bind(this);
    }


    getSoldTickets() {
        axios.post('http://localhost:5000/Ticket/get', {})
            .then(({data: u}) => {
                const mess = JSON.parse(u["message"]);
                const result = mess["Item2"];
                console.log(result);
                return result;
            });

    }

    async componentDidMount() {
        let myItems = [];

        const reserv = {
            "Filtering": {
                "SearchTerm": "Available"
            }
        };
        await axios.post('http://localhost:5000/Book/get', reserv)
            .then(({data: u}) => {
                const soldTickets = u["item2"];
                console.log(soldTickets);
                soldTickets.map(seat => {
                    if (seat.state === 1) {
                        myItems.push(seat);
                    }
                })
            });
        this.setState({
            seat: myItems,
            seatAvailable: myItems
        });


    }

    componentWillReceiveProps(nextProps) {
        const {user} = nextProps;
        this.setState({
            user: user,
            seatReserved: []
        });
    }


    handleSubmit(e) {
        e.preventDefault();
        const {user, seatReserved} = this.state;
        const {handleSubmit} = this.props;

        let myItems = [];
        this.state.seatAvailable.map((seat, id) => {
            myItems.push({
                Id: seat.Id
            })
        });
        this.state.seatReserved.map((seat, id) => {
            console.log(seat.Id);
        })
        console.log(myItems);
        console.log(this.state.seatReserved);

        console.log(user, seatReserved);

        handleSubmit(user, seatReserved);

        this.setState({user: {}});
    }

    handleChange(e, {name, value}) {
        const {user} = this.state;

        this.setState({user: {...user, [name]: value}, formChanged: true});
    }

    onClickData(seat) {
        if (this.state.seatReserved.indexOf(seat) > -1) {
            this.setState({
                seatAvailable: this.state.seatAvailable.concat(seat),
                seatReserved: this.state.seatReserved.filter(res => res !== seat)
            })
        } else {
            this.setState({
                seatReserved: this.state.seatReserved.concat(seat),
                seatAvailable: this.state.seatAvailable.filter(res => res !== seat)
            })
        }
        console.log(this.state.seatAvailable);
        console.log(this.state.seatReserved);
    }


    render() {
        console.log(this.state.user);
        const {page, totalPages} = this.state;
        const startIndex = page * TOTAL_PER_PAGE;
        const {user: {Name, Email, Address}, formChanged, seat, seatAvailable} = this.state;
        const {handleCancel, submitText = 'Create'} = this.props;
        console.log(seat);
        return (
            <div>
                <Table celled striped>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Id</Table.HeaderCell>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {seat.slice(startIndex, startIndex + TOTAL_PER_PAGE).map(reservation =>
                            (<Table.Row key={reservation.id}>
                                <Table.Cell> <Button onClick={()=>this.onClickData(reservation)}> {reservation.id}</Button></Table.Cell>
                                <Table.Cell>{reservation.name}</Table.Cell>
                            </Table.Row>),
                        )}
                    </Table.Body>
                    <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell colSpan={6}>
                                <Menu floated="right" pagination>
                                    {page !== 0 && <Menu.Item as="a" icon onClick={this.decrementPage}>
                                        <Icon name="left chevron"/>
                                    </Menu.Item>}
                                    {times(totalPages, n =>
                                        (<Menu.Item as="a" key={n} active={n === page} onClick={this.setPage(n)}>
                                            {n + 1}
                                        </Menu.Item>),
                                    )}
                                    {page !== (totalPages - 1) && <Menu.Item as="a" icon onClick={this.incrementPage}>
                                        <Icon name="right chevron"/>
                                    </Menu.Item>}
                                </Menu>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
                <Button  onClick={this.handleSubmit}> Add reservation</Button>
            </div>
        );
    }
}

export default UserForm;

