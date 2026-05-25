export async function getTrendingTitles() {
  const query = `
  query {

    manga: Page(page:1, perPage:15){
      media(
        sort:TRENDING_DESC
        type:MANGA
      ){
        id

        title{
          romaji
        }

        coverImage{
          extraLarge
        }

        genres
      }
    }

    anime: Page(page:1, perPage:15){
      media(
        sort:TRENDING_DESC
        type:ANIME
      ){
        id

        title{
          romaji
        }

        coverImage{
          extraLarge
        }

        genres
      }
    }

  }
`

  const response = await fetch(
    "https://graphql.anilist.co",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
      next: {
        revalidate: 3600,
      },
    }
  )

  const result = await response.json()

  const manga =
    result.data.manga.media.map((x:any)=>({

      id:x.id,
      name:x.title.romaji,
      coverImage:x.coverImage.extraLarge,
      type:"manga",
      badge:x.genres[0]

    }))

  const anime =
    result.data.anime.media.map((x:any)=>({

      id:x.id,
      name:x.title.romaji,
      coverImage:x.coverImage.extraLarge,
      type:"anime",
      badge:x.genres[0]

    }))

  return [...manga,...anime]
}