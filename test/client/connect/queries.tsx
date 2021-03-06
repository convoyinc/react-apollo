
import * as React from 'react';
import * as chai from 'chai';
import { mount } from 'enzyme';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import gql from 'graphql-tag';

import ApolloClient from 'apollo-client';

declare function require(name: string);
import chaiEnzyme = require('chai-enzyme');

chai.use(chaiEnzyme()); // Note the invocation at the end
const { expect } = chai;

import mockNetworkInterface from '../../mocks/mockNetworkInterface';
import {
  Passthrough,
  ProviderMock,
} from '../../mocks/components';

import connect from '../../../src/connect';

describe('queries', () => {
  it('binds a query to props', () => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface({
      request: { query },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

  function mapQueriesToProps() {
      return {
        people: { query },
      };
    };

    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    const wrapper = mount(
      <ProviderMock store={store} client={client}>
        <Container pass='through' baz={50} />
      </ProviderMock>
    );

    const props = wrapper.find('span').props() as any;

    expect(props.people).to.exist;
    expect(props.people.loading).to.be.true;
  });

  it('rebuilds the queries on state change', (done) => {
    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface({
      request: { query },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });
    let wrapper;
    let firstRun = true;
    function mapQueriesToProps({ state }) {
      if (!firstRun) {
        expect(state.counter).to.equal(2);
        wrapper.unmount();
        done();
      } else {
        firstRun = false;
      }
      return {
        people: { query },
      };
    };

    function counter(state = 1, action) {
      switch (action.type) {
        case 'INCREMENT':
          return state + 1
        default:
          return state
        }
    }

    // Typscript workaround
    const apolloReducer = client.reducer() as () => any;

    const store = createStore(
      combineReducers({
        counter,
        apollo: apolloReducer
      }),
      applyMiddleware(client.middleware())
    );

    let hasDispatched = false;
    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      componentWillReceiveProps(nextProps) {
        if (nextProps.people.allPeople && !hasDispatched) {
          hasDispatched = true;
          this.props.dispatch({ type: 'INCREMENT' });
        }
      }
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    wrapper = mount(
      <ProviderMock store={store} client={client}>
        <Container pass='through' baz={50} />
      </ProviderMock>
    ) as any;

  });

  it('correctly passes through changed redux state', (done) => {
    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface({
      request: { query },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    let wrapper;
    let firstRun = true;
    function mapQueriesToProps({ state }) {
      return {
        people: { query },
      };
    };

    function counter(state = 0, action) {
      switch (action.type) {
        case 'INCREMENT':
          return state + 1
        default:
          return state
        }
    }

    // Typscript workaround
    const apolloReducer = client.reducer() as () => any;

    const store = createStore(
      combineReducers({
        counter,
        apollo: apolloReducer
      }),
      applyMiddleware(client.middleware())
    );

    function mapStateToProps(state) {
      return {
        ctnr: state.counter + 1
      }
    }

    let finished;
    @connect({ mapStateToProps, mapQueriesToProps })
    class Container extends React.Component<any, any> {

      componentWillMount() {
        this.props.dispatch({ type: 'INCREMENT' });
      }

      componentWillReceiveProps(nextProps) {
        if (!nextProps.people.loading && !finished) {
          finished = true;
          expect(nextProps.ctnr).to.equal(2);
          done();
        }
      }

      render() {
        return <Passthrough {...this.props} />;
      }
    };

    wrapper = mount(
      <ProviderMock store={store} client={client}>
        <Container pass='through' baz={50} />
      </ProviderMock>
    ) as any;

  });

    it('correctly passes through changed redux state after a query result', (done) => {
    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface({
      request: { query },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    let wrapper;
    let firstRun = true;
    function mapQueriesToProps({ state }) {
      return {
        people: { query },
      };
    };

    function counter(state = 0, action) {
      switch (action.type) {
        case 'INCREMENT':
          return state + 1
        default:
          return state
        }
    }

    // Typscript workaround
    const apolloReducer = client.reducer() as () => any;

    const store = createStore(
      combineReducers({
        counter,
        apollo: apolloReducer
      }),
      applyMiddleware(client.middleware())
    );

    function mapStateToProps(state) {
      return {
        ctnr: state.counter + 1
      }
    }

    let hasDispatched = false;
    @connect({ mapStateToProps, mapQueriesToProps })
    class Container extends React.Component<any, any> {

      componentWillReceiveProps(nextProps) {
        if (!nextProps.people.loading && !hasDispatched) {
          hasDispatched = true;
          this.props.dispatch({ type: 'INCREMENT' });
        } else if (hasDispatched) {
          expect(nextProps.ctnr).to.equal(2);
          done();
        }
      }

      render() {
        return <Passthrough {...this.props} />;
      }
    };

    wrapper = mount(
      <ProviderMock store={store} client={client}>
        <Container pass='through' baz={50} />
      </ProviderMock>
    ) as any;

  });

  // taken from https://gist.github.com/sgoll/8519d638feb9489242f517cf954e4681
  it('doesn\'t rebuild the queries on dispatch if nothing has changed', () => {

    const demoAction = () => ({
      type: 'DEMO_ACTION',
    });

    const demoReducer = (state = 0, action) => (
      action.type === 'DEMO_ACTION' ? state + 1 : state
    );

    const DemoComponent = () => null;

    // whenever mapQueriesToProps is called, we extract ownProps for test
    let gotProps;

    const mapQueriesToProps = ({ ownProps }) => {
      gotProps = ownProps;
      // not necessary to actually set up any queries
      return {};
    };


    // wrap dummy component into connect'd container
    const DemoContainer = connect({ mapQueriesToProps })(
      DemoComponent
    );


    // initialize Apollo client and integrate into Redux store
    const client = new ApolloClient();

    // Typscript workaround
    const apolloReducer = client.reducer() as () => any;

    const store = createStore(
      combineReducers({
        demo: demoReducer,
        apollo: apolloReducer,
      }),
      applyMiddleware(client.middleware())
    );


    // simple root container that forwards props (changed with setProps
    // below) to demo component
    const Root = (props) => (
      <ProviderMock client={client} store={store}>
        <DemoContainer {...props} />
      </ProviderMock>
    );


    // on initial render, we expect mapQueriesToProps to be called with
    // passed prop value "foo"
    const wrapper = mount(<Root value='foo' />);
    expect(gotProps.value).to.equal('foo');

    // now we change prop value to "bar", expect mapQueriesToProps call
    // with updated prop value "bar"
    wrapper.setProps({ value: 'bar' });
    expect(gotProps.value).to.equal('bar');

    // running an arbitrary action that changes the store state should
    // not update the prop value passed to mapQueriesToProps
    client.store.dispatch(demoAction() as any);
    expect(gotProps.value).to.equal('bar');

  });

  it('rebuilds the queries on prop change', (done) => {
    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface({
      request: { query },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    let firstRun = true;
    function mapQueriesToProps({ ownProps }) {
      if (!firstRun) {
        expect(ownProps.listId).to.equal(2);
        done();
      } else {
        firstRun = false;
      }
      return {
        people: { query },
      };
    };


    let hasDispatched = false;
    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    class ChangingProps extends React.Component<any, any> {

      state = {
        listId: 1
      }

      componentDidMount() {
        setTimeout(() => {
          this.setState({
            listId: 2,
          });
        }, 50);
      }

      render() {
        return <Container listId={this.state.listId} />
      }

    }

    mount(
      <ProviderMock client={client}>
        <ChangingProps />
      </ProviderMock>
    );

  });

  it('does rerun the query if it changes', (done) => {
    const query = gql`
      query people($person: Int!) {
        allPeople(first: $person) {
          people {
            name
          }
        }
      }
    `;

    const data1 = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const data2 = {
      allPeople: {
        people: [
          {
            name: 'Leia Skywalker',
          },
        ],
      },
    };

    const variables1 = {
      person: 1,
    }

    const variables2 = {
      person: 2,
    }

    const networkInterface = mockNetworkInterface(
      {
        request: { query, variables: variables1 },
        result: { data: data1 },
      },
      {
        request: { query, variables: variables2 },
        result: { data: data2 },
      }
    );

    const client = new ApolloClient({
      networkInterface,
    });

    function mapQueriesToProps({ state }) {
      return {
        people: {
          query,
          variables: {
            person: state.counter,
          }
        },
      };
    };

    function counter(state = 1, action) {
      switch (action.type) {
        case 'INCREMENT':
          return state + 1
        default:
          return state;
        }
    }

    // Typscript workaround
    const apolloReducer = client.reducer() as () => any;

    const store = createStore(
      combineReducers({
        counter,
        apollo: apolloReducer
      }),
      applyMiddleware(client.middleware())
    );

    let hasDispatched = false;
    let count = 0;
    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      componentDidMount(){
        count++; // increase for the loading
      }

      componentWillReceiveProps(nextProps) {
        count++;
        if (nextProps.people.allPeople && !hasDispatched) {
          hasDispatched = true;
          this.props.dispatch({ type: 'INCREMENT' });
        }
      }
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    mount(
      <ProviderMock store={store} client={client}>
        <Container pass='through' baz={50} />
      </ProviderMock>
    );

    setTimeout(() => {
      expect(count).to.equal(3);
      done();
    }, 250);
  });

  it('stops the query after unmounting', () => {
    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface({
      request: { query },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

  function mapQueriesToProps() {
      return {
        people: { query },
      };
    };

    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    const wrapper = mount(
      <ProviderMock client={client}>
        <Container pass='through' baz={50} />
      </ProviderMock>
    ) as any;

    const props = wrapper.find('span').props() as any;

    expect(props.people).to.exist;
    expect(props.people.loading).to.be.true;

    expect(wrapper.unmount()).to.not.throw;
  });

  it('exposes refetch as part of the props api', () => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface({
      request: { query },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

  function mapQueriesToProps() {
      return {
        people: { query },
      };
    };

    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    const wrapper = mount(
      <ProviderMock store={store} client={client}>
        <Container pass='through' baz={50} />
      </ProviderMock>
    );

    const props = wrapper.find('span').props() as any;

    expect(props.people).to.exist;
    expect(props.people.refetch).to.be.exist;
    expect(props.people.refetch).to.be.instanceof(Function);
    expect(props.people.refetch).to.not.throw;
  });

  it('exposes startPolling as part of the props api', () => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface({
      request: { query },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

  function mapQueriesToProps() {
      return {
        people: { query },
      };
    };

    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    const wrapper = mount(
      <ProviderMock store={store} client={client}>
        <Container pass='through' baz={50} />
      </ProviderMock>
    );

    const props = wrapper.find('span').props() as any;

    expect(props.people).to.exist;
    expect(props.people.startPolling).to.be.exist;
    expect(props.people.startPolling).to.be.instanceof(Function);
    expect(props.people.startPolling).to.not.throw;
  });

  it('exposes stopPolling as part of the props api', () => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface({
      request: { query },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

  function mapQueriesToProps() {
      return {
        people: { query },
      };
    };

    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    const wrapper = mount(
      <ProviderMock store={store} client={client}>
        <Container pass='through' baz={50} />
      </ProviderMock>
    );

    const props = wrapper.find('span').props() as any;

    expect(props.people).to.exist;
    expect(props.people.stopPolling).to.be.exist;
    expect(props.people.stopPolling).to.be.instanceof(Function);
    expect(props.people.stopPolling).to.not.throw;
  });

  it('returns a promise when refetching', (done) => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface(
      {
        request: { query },
        result: { data },
      },
      {
        request: { query },
        result: { data },
      }
    );

    const client = new ApolloClient({
      networkInterface,
    });

    function mapQueriesToProps() {
      return {
        people: { query },
      };
    };

    let hasRefetched = false;
    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      componentDidUpdate(prevProps) {

        if (prevProps.people.loading && !this.props.people.loading) {
          if (hasRefetched) {
            return;
          }
          hasRefetched = true;
          this.props.people.refetch()
            .then((refetchedResult) => {
              expect(refetchedResult.data).to.deep.equal(data);
              done();
            });
          return;
        }

      }
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    mount(
      <ProviderMock store={store} client={client}>
        <Container pass='through' baz={50} />
      </ProviderMock>
    );
  });

  it('resets the loading state after a refetched query', (done) => {

    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data1 = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const data2 = {
      allPeople: {
        people: [
          {
            name: 'Han Solo',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface(
      {
        request: { query: query },
        result: { data: data1 },
      },
      {
        request: { query: query },
        result: { data: data2 },
      }
    );

    const client = new ApolloClient({
      networkInterface,
    });

    function mapQueriesToProps() {
      return {
        people: { query },
      };
    };

    let hasRefetched = false;
    let hasRefetchedAndReturned = false;
    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      componentWillReceiveProps(nextProps) {
        if (hasRefetchedAndReturned) {
          expect(nextProps.people.loading).to.be.false;
          done();
          return;
        }

        if (hasRefetched) {
          expect(nextProps.people.loading).to.be.true;
          hasRefetchedAndReturned = true;
          return;
        }
      }

      componentDidUpdate(prevProps) {

        if (prevProps.people.loading && !this.props.people.loading) {

          if (hasRefetched) {
            return;
          }

          hasRefetched = true;
          this.props.people.refetch()
          return;
        }

      }
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    mount(
      <ProviderMock client={client}>
        <Container />
      </ProviderMock>
    );
  });

  it('resets the loading state and reports errors after a failed refetch', (done) => {

    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const result1 = {
      data: {
        people_one: {
          name: 'Luke Skywalker',
        },
      },
    };

    const result2 = {
      errors: [
        {
          name: 'PeopleError',
          message: 'This is not the person you are looking for.',
        },
      ],
    };

    const networkInterface = mockNetworkInterface(
      {
        request: { query: query },
        result: result1,
      },
      {
        request: { query: query },
        result: result2,
      }
    );

    const client = new ApolloClient({
      networkInterface,
    });

    function mapQueriesToProps() {
      return {
        people: { query },
      };
    };

    let hasRefetched = false;
    let hasRefetchedAndReturned = false;
    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      componentWillReceiveProps(nextProps) {
        if (hasRefetchedAndReturned) {
          expect(nextProps.people.loading).to.be.false;
          expect(nextProps.people.errors.graphQLErrors).to.deep.eq([
            {
              name: 'PeopleError',
              message: 'This is not the person you are looking for.',
            },
          ]);
          done();
          return;
        }

        if (hasRefetched) {
          expect(nextProps.people.loading).to.be.true;
          hasRefetchedAndReturned = true;
          return;
        }
      }

      componentDidUpdate(prevProps) {

        if (prevProps.people.loading && !this.props.people.loading) {

          if (hasRefetched) {
            return;
          }

          hasRefetched = true;
          this.props.people.refetch()
          return;
        }

      }
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    mount(
      <ProviderMock client={client}>
        <Container />
      </ProviderMock>
    );
  });

  it('resets the loading state after a refetched query even if the data doesn\'t change', (done) => {

    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data1 = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface(
      {
        request: { query: query },
        result: { data: data1 },
      },
      {
        request: { query: query },
        result: { data: data1 },
      }
    );

    const client = new ApolloClient({
      networkInterface,
    });

    function mapQueriesToProps() {
      return {
        people: { query },
      };
    };

    let hasRefetched = false;
    let hasRefetchedAndReturned = false;
    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      componentWillReceiveProps(nextProps) {

        if (hasRefetchedAndReturned) {
          expect(nextProps.people.loading).to.be.false;
          done();
          return;
        }

        if (hasRefetched) {
          expect(nextProps.people.loading).to.be.true;
          hasRefetchedAndReturned = true;
          return;
        }
      }

      componentDidUpdate(prevProps) {

        if (prevProps.people.loading && !this.props.people.loading) {

          if (hasRefetched) {
            return;
          }

          hasRefetched = true;
          this.props.people.refetch()
          return;
        }

      }
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    mount(
      <ProviderMock client={client}>
        <Container />
      </ProviderMock>
    );
  });

  it('resets the loading state when refetching', (done) => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface({
      request: { query },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    function mapQueriesToProps() {
      return {
        people: { query },
      };
    };

    let hasRefetched = false;
    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      componentDidUpdate(prevProps) {

        if (prevProps.people.loading && !this.props.people.loading) {
          if (hasRefetched) {
            return;
          }
          hasRefetched = true;
          this.props.people.refetch();
          return;
        }

        if (this.props.people.loading) {
          expect(this.props.people.loading).to.be.true;
          expect(this.props.people.allPeople).to.exist;
          done();
        }

      }
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    mount(
      <ProviderMock store={store} client={client}>
        <Container pass='through' baz={50} />
      </ProviderMock>
    );
  });

  it('allows a polling query to be created', (done) => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data1 = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const data2 = {
      allPeople: {
        people: [
          {
            name: 'Leia Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface(
      {
        request: { query },
        result: { data: data1 },
      },
      {
        request: { query },
        result: { data: data2 },
      },
      {
        request: { query },
        result: { data: data2 },
      }
    );

    const client = new ApolloClient({
      networkInterface,
    });

    function mapQueriesToProps() {
      return {
        people: {
          query,
          pollInterval: 75,
        },
      };
    };

    let count = 0;
    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      componentDidUpdate(prevProps) {
        count++;
      }
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    mount(
      <ProviderMock store={store} client={client}>
        <Container pass='through' baz={50} />
      </ProviderMock>
    );

    setTimeout(() => {
      expect(count).to.equal(2);
      done();
    }, 160);
  });

  it('does not overly rerender if data doesn\'t change', (done) => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data1 = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const data2 = {
      allPeople: {
        people: [
          {
            name: 'Leia Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface(
      {
        request: { query },
        result: { data: data1 },
      },
      {
        request: { query },
        result: { data: data2 },
      },
      {
        request: { query },
        result: { data: data2 },
      },
      {
        request: { query },
        result: { data: data2 },
      }
    );

    const client = new ApolloClient({
      networkInterface,
    });

    function mapQueriesToProps() {
      return {
        people: {
          query,
          pollInterval: 75,
        },
      };
    };

    let count = 0;
    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      componentDidUpdate(prevProps) {
        count++;
      }
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    mount(
      <ProviderMock store={store} client={client}>
        <Container pass='through' baz={50} />
      </ProviderMock>
    );

    setTimeout(() => {
      expect(count).to.equal(2);
      done();
    }, 250);
  });


  it('allows variables as part of the request', () => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const query = gql`
      query people($count: Int) {
        allPeople(first: $count) {
          people {
            name
          }
        }
      }
    `;

    const variables = {
      count: 1,
    };

    const data = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };


    const networkInterface = mockNetworkInterface({
      request: { query, variables },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

  function mapQueriesToProps() {
      return {
        people: { query, variables },
      };
    };

    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    const wrapper = mount(
      <ProviderMock store={store} client={client}>
        <Container pass='through' baz={50} />
      </ProviderMock>
    );

    const props = wrapper.find('span').props() as any;

    expect(props.people).to.exist;
    expect(props.people.loading).to.be.true;
  });

  it('can use passed props as part of the query', () => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const query = gql`
      query people($count: Int) {
        allPeople(first: $count) {
          people {
            name
          }
        }
      }
    `;

    const variables = {
      count: 1,
    };

    const data = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };


    const networkInterface = mockNetworkInterface({
      request: { query, variables },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    function mapQueriesToProps({ ownProps }) {
      expect(ownProps.passedCountProp).to.equal(2);
      return {
        people: {
          query,
          variables: {
            count: ownProps.passedCountProp,
          },
        },
      };
    };

    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    const wrapper = mount(
      <ProviderMock store={store} client={client}>
        <Container passedCountProp={2} />
      </ProviderMock>
    );

    const props = wrapper.find('span').props() as any;

    expect(props.people).to.exist;
    expect(props.people.loading).to.be.true;
  });

  it('can use the redux state as part of the query', () => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const query = gql`
      query people($count: Int) {
        allPeople(first: $count) {
          people {
            name
          }
        }
      }
    `;

    const variables = {
      count: 1,
    };

    const data = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };


    const networkInterface = mockNetworkInterface({
      request: { query, variables },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    function mapQueriesToProps({ state }) {
      expect(state.hello).to.equal('world');
      return {
        people: {
          query,
          variables: {
            count: 1,
          },
        },
      };
    };

    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    const wrapper = mount(
      <ProviderMock store={store} client={client}>
        <Container passedCountProp={2} />
      </ProviderMock>
    );

    const props = wrapper.find('span').props() as any;

    expect(props.people).to.exist;
    expect(props.people.loading).to.be.true;
  });

  it('allows for multiple queries', () => {
    const store = createStore(() => ({
      foo: 'bar',
      baz: 42,
      hello: 'world',
    }));

    const peopleQuery = gql`
      query people($count: Int) {
        allPeople(first: $count) {
          people {
            name
          }
        }
      }
    `;

    const peopleData = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    // const shipData = {
    //   allStarships: {
    //     starships: [
    //       {
    //         name: 'CR90 corvette',
    //       },
    //     ],
    //   },
    // };

    const shipQuery = gql`
      query starships($count: Int) {
        allStarships(first: $count) {
          starships {
            name
          }
        }
      }
    `;

    const variables = { count: 1 };

    const networkInterface = mockNetworkInterface({
      request: { query: peopleQuery, variables },
      result: { data: peopleData },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    function mapQueriesToProps() {
      return {
        people: { query: peopleQuery, variables },
        ships: { query: shipQuery, variables },
      };
    };

    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    const wrapper = mount(
      <ProviderMock store={store} client={client}>
        <Container />
      </ProviderMock>
    );

    const props = wrapper.find('span').props() as any;

    expect(props.people).to.exist;
    expect(props.people.loading).to.be.true;

    expect(props.ships).to.exist;
    expect(props.ships.loading).to.be.true;
  });


  it('should update the props of the child component when data is returned', (done) => {
    const store = createStore(() => ({ }));

    const query = gql`
      query people {
        luke: allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data = {
      luke: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface({
      request: { query },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    function mapQueriesToProps() {
      return {
        luke: { query },
      };
    };

    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      componentDidUpdate(prevProps) {
        expect(prevProps.luke.loading).to.be.true;
        expect(this.props.luke.luke).to.deep.equal(data.luke);
        done();
      }
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    mount(
      <ProviderMock store={store} client={client}>
        <Container />
      </ProviderMock>
    );
  });

  it('should update props after fetching more with fetchMore', (done) => {
    const store = createStore(() => ({ }));

    const query = gql`
      query people($skip: Int) {
        allPeople(first: 1, skip: $skip) {
          people {
            name
          }
        }
      }
    `;

    const variables = { skip: 0 };
    const variablesMore = { skip: 1 };

    const data = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const dataMore = {
      allPeople: {
        people: [
          {
            name: 'Anakin Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface({
      request: { query, variables },
      result: { data },
    }, {
      request: { query, variables: variablesMore },
      result: { data: dataMore },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    function mapQueriesToProps() {
      return {
        luke: { query, variables },
      };
    };

    let iter = 0;

    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {
      componentDidUpdate(prevProps) {
        if (iter === 0) {
          expect(prevProps.luke.loading).to.be.true;
          expect(this.props.luke.allPeople).to.deep.equal(data.allPeople);
          this.props.luke.fetchMore({
            variables: variablesMore,
            updateQuery: (prev, { fetchMoreResult }) => {
              return {
                allPeople: {
                  people: prev.allPeople.people.concat(fetchMoreResult.data.allPeople.people),
                },
              };
            },
          });
        } else if (iter === 1) {
          expect(prevProps.luke.loading).to.be.true;
          expect(this.props.luke.allPeople).to.deep.equal(data.allPeople);
        } else if (iter === 2) {
          expect(this.props.luke.loading).to.be.false;
          expect(this.props.luke.allPeople.people).to.deep.equal(data.allPeople.people.concat(dataMore.allPeople.people));
          done();
        } else {
          throw new Error('should not reach this statement');
        }
        iter++;
      }
      render() {
        return <Passthrough {...this.props} />;
      }
    };

    mount(
      <ProviderMock store={store} client={client}>
        <Container />
      </ProviderMock>
    );
  });

  it('should prefill any data already in the store', (done) => {

    const query = gql`
      query people {
        allPeople(first: 1) {
          people {
            name
          }
        }
      }
    `;

    const data = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const networkInterface = mockNetworkInterface({
      request: { query },
      result: { data },
    });

    const client = new ApolloClient({
      networkInterface,
    });

    const reducer = client.reducer() as any;

    const store = createStore(
      combineReducers({
        apollo: reducer,
      }),
      applyMiddleware(client.middleware())
    );

    // we prefill the store with a query
    client.query({ query })
      .then(() => {
        function mapQueriesToProps() {
          return {
            people: { query },
          };
        };

        @connect({ mapQueriesToProps })
        class Container extends React.Component<any, any> {
          render() {
            return <Passthrough {...this.props} />;
          }
        };

        const wrapper = mount(
          <ProviderMock store={store} client={client}>
            <Container pass='through' baz={50} />
          </ProviderMock>
        );

        const props = wrapper.find('span').props() as any;

        expect(props.people).to.exist;
        expect(props.people.loading).to.be.false;
        expect(props.people.allPeople).to.deep.equal(data.allPeople);
        done();
      });
  });

  it('doesn\'t rerun the query if it doesn\'t change', (done) => {
    const query = gql`
      query people($person: Int!) {
        allPeople(first: $person) {
          people {
            name
          }
        }
      }
    `;

    const data1 = {
      allPeople: {
        people: [
          {
            name: 'Luke Skywalker',
          },
        ],
      },
    };

    const data2 = {
      allPeople: {
        people: [
          {
            name: 'Leia Skywalker',
          },
        ],
      },
    };

    const variables1 = {
      person: 1
    }

    const variables2 = {
      person: 2
    }

    const networkInterface = mockNetworkInterface(
      {
        request: { query, variables: variables1 },
        result: { data: data1 },
      },
      {
        request: { query, variables: variables2 },
        result: { data: data2 },
      }
    );

    const client = new ApolloClient({
      networkInterface,
    });

    function mapQueriesToProps() {
      return {
        foobar: {
          query,
          variables: {
            person: 1,
          }
        },
      };
    };

    function counter(state = 1, action) {
      switch (action.type) {
        case 'INCREMENT':
          return state + 1
        default:
          return state
        }
    }

    // Typscript workaround
    const apolloReducer = client.reducer() as () => any;

    const store = createStore(
      combineReducers({
        counter,
        apollo: apolloReducer
      }),
      applyMiddleware(client.middleware())
    );

    let hasDispatched = false;
    let localcount = 0;
    @connect({ mapQueriesToProps })
    class Container extends React.Component<any, any> {

      componentWillReceiveProps(nextProps) {
        if (nextProps.foobar.allPeople && !hasDispatched) {
          hasDispatched = true;
          this.props.dispatch({ type: 'INCREMENT' });
        }
      }
      componentDidUpdate() {
        localcount++;
      }

      render() {
        return <Passthrough {...this.props} />;
      }
    };

    const wrapper = mount(
      <ProviderMock store={store} client={client}>
        <Container />
      </ProviderMock>
    );

    setTimeout(() => {
      expect(localcount).to.equal(1);
      done();
    }, 100);
  });
  it('should not swallow errors', (done) => {
    const query = gql`
      query sample {
        viewer {
          name
        }
      }
    `;

    const data = {
      viewer: { name: 'James' },
    };

    const networkInterface = mockNetworkInterface({
      request: { query },
      result: { data },
      delay: 10,
    });

    const client = new ApolloClient({
      networkInterface,
    });

    let count = 0;
    function BadComponent(props) {
      count++;
      if (props.data.loading) {
        return null;
      }

      if (props.data.errors) {
        done(props.data.errors);
        return null;
      } else if (count === 2) {
        done();
        return null;
      }

      const name = props.data.typo.name;
      return <p>Hi {name}</p>;
    }

    function mapQueriesToProps() {
      return {
        data: { query },
      };
    }

    const BadContainer = connect({
      mapQueriesToProps,
    })(BadComponent);

    mount(
      <ProviderMock client={client}>
        <BadContainer />
      </ProviderMock>
    );
  });
});
