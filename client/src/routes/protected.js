import React from "react"
import gql from "graphql-tag"
import {Query} from "react-apollo"

const CURRENT_USER_QUERY = gql`
  query {
    user {
      id
      email
      facets {
        items {
          name
          key {
            name
          }
        }
      }
    }
  }
`
const facetQuery = (facetValue, facet, index) => {

  const allFacets = {
    country: "allCountry",
    city: "allCity",
    department: "allDepartment"
  };

  let query = `{
    facets:
    {some:
      {
         key:
        {
          name: {
            contains: "${facet}"
          }
        },
        AND:{
          name: {
            in:
            ["${facetValue}","${allFacets[facet]}"]
          }
        }
      }
    }
  ${index === 0 ? '' : '}'}`

  return query;
}

const fetchFacets = (facetValues, facets) => {
  const facetArray = [];
  facetValues.forEach(( _, i)=> {
    const facet = facetQuery(facetValues[i], facets[i], i);
    facetArray.push(facet);
  })
 
  let payloadQuery = `
  query{
    postsList(filter:
        ${facetArray[0]}
        ${facetArray.length > 1 ? `,AND:[${facetArray.slice(1,)}]` : ``}
    })
    {
      items{
        title
        facets{
          items{
            name
          }
        }
      }
    }
  }  
  `
  console.log(payloadQuery);
}



const completed = data => {
  let facetValues = []
  let facets = []

  if (data) {
    try {
      data.user.facets.items.forEach(el => {
        facetValues.push(el.name)
        facets.push(el.key.name)
      })
    } catch (e) {
      console.log(e)
    }
    if (facetValues.length !== facets.length || (facetValues.length === 0 || facets.length === 0) ){
      console.log('facets mal puestas xd')
      return;
    };
    fetchFacets(facetValues, facets)
    return
  }
}

export const Protected = () => (
  <Query query={CURRENT_USER_QUERY} onCompleted={completed}>
    {({loading, data, error}) => {
      if (loading) {
        return <div>Loading...</div>
      }
      return (
        <div>
          {JSON.stringify(error)}
          Protected route, your email: {data && data.user && data.user.email}!
        </div>
      )
    }}
  </Query>
)
