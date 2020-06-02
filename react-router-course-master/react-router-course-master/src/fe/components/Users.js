import React from 'react';
import {Table, Menu, Icon, Button, Input, Label, Modal} from 'semantic-ui-react';
import axios, {get} from 'axios';
import times from 'lodash.times';
import {Helmet} from 'react-helmet';
import {Link, Route} from 'react-router-dom';
import Page from './Page';

import users from '../../../users.json';


const TOTAL_PER_PAGE = 10;

class Users extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            users: [],
            users2: [],
            displayedUsers: [],
            displayedUsers2: [],
            reservations: [],
            reservations2: [],
            displayedReservations: [],
            displayedReservations2: [],
            username: '',
            userId: '',
            page: 0,
            totalPages: 0,
            searchValue: '',
            warningLabel: 'Press enter for search',
            administratorLoggedIn: false
        };
        this.incrementPage = this.incrementPage.bind(this);
        this.decrementPage = this.decrementPage.bind(this);
        this.setPage = this.setPage.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.checkSearchValue = this.checkSearchValue.bind(this);
        this.getUsersToDisplay = this.getUsersToDisplay.bind(this);
    }

    componentDidMount() {
        console.log("hi2");
        this.setState({administratorLoggedIn: false});
        const {match: {params}} = this.props;
        this.setState({username: params.username}, () => {
            console.log(params.username);
            const spectator = {
                "Pagination": {
                    "Take": 1
                },
                "Filtering": {
                    "SearchTerm": params.username
                }
            }
            console.log(spectator);
            axios.post('http://localhost:5000/User/get', spectator)
                .then(({data: u}) => {
                    console.log(u["item2"][0]["id"]);
                    if (u["item2"][0]["type"] === 1) {
                        console.log(u["item2"][0]["type"]);
                        this.setState({administratorLoggedIn: true});
                    }

                    this.setState({userId: u["item2"][0]["id"]}, () => {
                        this.getUsers();
                    });

                    console.log(this.state.userId);
                });
            this.getUsers();
        });

    }

    componentWillReceiveProps({location = {}}) {
        if (location.pathname === '/library' && location.pathname !== this.props.location.pathname) {
            console.log("hi");
            this.getUsers();
        }
    }

    getUsers() {
        const {userId, administratorLoggedIn} = this.state;
        console.log(this.state.userId);
        console.log(userId);
        const reservation = {
            "Filtering": {
                "SearchTerm": "Available"
            }
        }

        //aici va fi un HTTPget Carti si o sa setez pt al doilea tabel displayedCarti
        //cartile care au abonat id = this.state.userId
        //pt primul tabel o sa am un displayCartiDisponibile unde iau cu get toate cartile si apoi fac o filtrare ca statulsul cartii sa fie disponibil
        axios.post('http://localhost:5000/Book/get', reservation)
            .then(({data: u}) => {
                const result = u["item2"];
                console.log(result);
                this.setState({reservations: result});
                console.log(this.state.reservations);

                const totalPages = Math.ceil(result.length / TOTAL_PER_PAGE);

                this.setState({
                    users: result,
                    displayedUsers: result,
                    page: 0,
                    totalPages,
                }, () => {

                    if (!administratorLoggedIn) {

                        const reservation2 = {
                            "Filtering": {
                                "SearchTerm": this.state.userId
                            }
                        }
                        console.log(reservation);

                        //aici va fi un HTTPget Carti si o sa setez pt al doilea tabel displayedCarti
                        //cartile care au abonat id = this.state.userId
                        //pt primul tabel o sa am un displayCartiDisponibile unde iau cu get toate cartile si apoi fac o filtrare ca statulsul cartii sa fie disponibil
                        axios.post('http://localhost:5000/Book/get', reservation2)
                            .then(({data: u}) => {
                                const result = u["item2"];
                                console.log(this.state.userId);
                                console.log(result.filter(u => u.state === 3));
                                this.setState({reservations2: result.filter(u => u.state === 3)});
                                console.log(this.state.reservations);

                                const totalPages = Math.ceil(result.length / TOTAL_PER_PAGE);

                                this.setState({
                                    users2: result.filter(u => u.state === 3),
                                    displayedUsers2: result.filter(u => u.state === 3),
                                    page: 0,
                                    totalPages,
                                });
                            });
                        console.log(this.state.displayedUsers2);
                    } else {
                        const reservation2 = {
                            "Filtering": {
                                "SearchTerm": "RefundInProgress"
                            }
                        }
                        axios.post('http://localhost:5000/Book/get', reservation2)
                            .then(({data: u}) => {
                                const result = u["item2"];
                                console.log(this.state.userId);
                                console.log(result);
                                this.setState({reservations2: result});
                                console.log(this.state.reservations);

                                const totalPages = Math.ceil(result.length / TOTAL_PER_PAGE);

                                this.setState({
                                    users2: result,
                                    displayedUsers2: result,
                                    page: 0,
                                    totalPages,
                                });
                            });
                    }

                });
            });


    }


    setPage(page) {
        return () => {
            this.setState({page});
        };
    }

    decrementPage() {
        const {page} = this.state;

        this.setState({page: page - 1});
    }

    incrementPage() {
        const {page} = this.state;

        this.setState({page: page + 1});
    }

    handleDelete(book) {
        const {users, userId, displayedUsers, administratorLoggedIn} = this.state;
        console.log("handling delete");
        if (!administratorLoggedIn) {
            const newBook = {
                "id": book.id,
                "name": book.name,
                "state": 2,
                "userId": userId
            }
            console.log(newBook);
            axios.put(`http://localhost:5000/Book`, newBook)
                .then(({data: u}) => {
                    console.log(u);
                    history.push(`/library/${username}`);
                });
        } else {
            const newBook = {
                "id": book.id,
                "name": book.name,
                "state": 1,
                "userId": userId
            }
            console.log(newBook);
            axios.put(`http://localhost:5000/Book`, newBook)
                .then(({data: u}) => {
                    console.log(u);
                    history.push(`/library/${username}`);
                });
        }
    }


    handleDeleteBook(book) {
        const {administratorLoggedIn} = this.state;
        console.log("handling delete");
        if (administratorLoggedIn) {
            axios.delete(`http://localhost:5000/Book/?id=${book.id}`)
                .then(({data: u}) => {
                    console.log(u["message"]);
                    history.push(`/library/${username}`);
                });
        }
    }

    handleChange(e) {
        this.setState({searchValue: e.target.value})
        console.log(this.state.searchValue)
    }

    checkSearchValue(user) {
        console.log(user);
        const {searchValue} = this.state;
        Object.keys(user).map((e, i) => {
            console.log(user[e].toString().toLowerCase());
            console.log(searchValue.toString().toLowerCase());
            if (
                user[e].toString().toLowerCase().includes(searchValue.toString().toLowerCase())) {
                console.log(user[e].toString().toLowerCase());
                console.log(searchValue.toString().toLowerCase());
                return true;
            }
        })
        return false;
    }

    getUsersToDisplay() {
        const {searchValue} = this.state;
        const {users} = this.state;
        const usersToDisplay = [];
        users.filter(user => {
                Object.keys(user).map((e, i) => {
                    if (user[e].toString().toLowerCase().includes(searchValue.toString().toLowerCase())) {
                        usersToDisplay.push(user);
                    }
                })
            }
        )
        return usersToDisplay;
    }

    handleKeyDown(e) {
        const {searchValue} = this.state;
        const {users} = this.state;
        console.log(this.state.searchValue)
        if (e.key === 'Enter') {
            if (searchValue === '') {
                this.setState({
                    displayedUsers: users,
                    searchValue: '',
                    warningLabel: 'cold t find any name'
                });
            } else {
                console.log(users);
                this.setState({
                    displayedUsers: this.getUsersToDisplay(),
                    searchValue: '',
                    warningLabel: 'Press enter for search'
                });
            }
        }
    }

    render() {
        //<Input placeholder='Search...' value={this.state.searchValue} onChange={this.handleChange} onKeyDown={this.handleKeyDown}/>
        //         <Label pointing='left' >{warningLabel}</Label>
        const {users, id, displayedUsers, administratorLoggedIn, displayedUsers2, page, totalPages, username, warningLabel} = this.state;
        const startIndex = page * TOTAL_PER_PAGE;
        console.log(username);
        console.log(this.state.displayedUsers);
        return (
            <Page title="">
                <Helmet>
                    <title></title>
                </Helmet>

                <div>
                    {administratorLoggedIn ? (
                        <div>
                            <h4>Available books in the library</h4>
                        <Table celled striped>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>BookId</Table.HeaderCell>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {displayedUsers.slice(startIndex, startIndex + TOTAL_PER_PAGE).map(reservation =>
                                    (<Table.Row key={reservation.id}>
                                        <Table.Cell> <Button negative
                                                             onClick={() => this.handleDeleteBook(reservation)}>Delete
                                            book {reservation.id}</Button></Table.Cell>
                                        <Table.Cell>{reservation.name}</Table.Cell>
                                    </Table.Row>)
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
                                                (<Menu.Item as="a" key={n} active={n === page}
                                                            onClick={this.setPage(n)}>
                                                    {n + 1}
                                                </Menu.Item>),
                                            )}
                                            {page !== (totalPages - 1) &&
                                            <Menu.Item as="a" icon onClick={this.incrementPage}>
                                                <Icon name="right chevron"/>
                                            </Menu.Item>}
                                        </Menu>
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Footer>
                        </Table>
                        </div>
                    ) : (
                        <div>                        <h4>Available books in the library</h4>

                            <Table celled striped>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>BookId</Table.HeaderCell>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {displayedUsers.slice(startIndex, startIndex + TOTAL_PER_PAGE).map(reservation =>
                                    (<Table.Row key={reservation.id}>
                                        <Table.Cell>{reservation.id}</Table.Cell>
                                        <Table.Cell>{reservation.name}</Table.Cell>
                                    </Table.Row>)
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
                                                (<Menu.Item as="a" key={n} active={n === page}
                                                            onClick={this.setPage(n)}>
                                                    {n + 1}
                                                </Menu.Item>),
                                            )}
                                            {page !== (totalPages - 1) &&
                                            <Menu.Item as="a" icon onClick={this.incrementPage}>
                                                <Icon name="right chevron"/>
                                            </Menu.Item>}
                                        </Menu>
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Footer>
                        </Table>
                        </div>
                    )} </div>

                <div>
                    {administratorLoggedIn ? (
                        <div>
                            <h4>Books that wait to be accepted as refounded</h4>

                        <Table celled striped>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>BookId</Table.HeaderCell>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {displayedUsers2.slice(startIndex, startIndex + TOTAL_PER_PAGE).map(reservation =>
                                    (<Table.Row key={reservation.id}>
                                        <Table.Cell> <Button negative onClick={() => this.handleDelete(reservation)}>Set
                                            book
                                            status=available for {reservation.id}</Button></Table.Cell>
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
                                                (<Menu.Item as="a" key={n} active={n === page}
                                                            onClick={this.setPage(n)}>
                                                    {n + 1}
                                                </Menu.Item>),
                                            )}
                                            {page !== (totalPages - 1) &&
                                            <Menu.Item as="a" icon onClick={this.incrementPage}>
                                                <Icon name="right chevron"/>
                                            </Menu.Item>}
                                        </Menu>
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Footer>
                        </Table>
                        </div>
                    ) : (
                        <div>
                            <h4>Books that you reserver</h4>

                            <Table celled striped>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>BookId</Table.HeaderCell>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {displayedUsers2.slice(startIndex, startIndex + TOTAL_PER_PAGE).map(reservation =>
                                    (<Table.Row key={reservation.id}>
                                        <Table.Cell> <Button negative onClick={() => this.handleDelete(reservation)}>Set
                                            book
                                            status=refund_in_proccess for {reservation.id}</Button></Table.Cell>
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
                                                (<Menu.Item as="a" key={n} active={n === page}
                                                            onClick={this.setPage(n)}>
                                                    {n + 1}
                                                </Menu.Item>),
                                            )}
                                            {page !== (totalPages - 1) &&
                                            <Menu.Item as="a" icon onClick={this.incrementPage}>
                                                <Icon name="right chevron"/>
                                            </Menu.Item>}
                                        </Menu>
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Footer>
                        </Table>
                            <Link to={`/library/${username}/new`}>
                                <Button positive>New reservation</Button>
                            </Link>
                        </div>
                    )}
                </div>



            </Page>
        );
    }

}

export default Users;
