// import axios from 'axios';

// const translationCache: { [key: string]: string } = {};

// /**
//  * Translates the title using Google Translate API and caches the result.
//  * @param title - The title text to translate.
//  * @param targetLang - The target language code 
//  * @returns
//  */
// async function translateTitle(title: string, targetLang: string): Promise<string | null> {
//     const apiKey = 'AIzaSyAFq0hcq3i7sSfX9NFFn6-nctMWt7HUYec'; // Your Google API key

//     const cacheKey = `${title}-${targetLang}`;
//     if (translationCache[cacheKey]) {
//         console.log(`Using cached translation for: ${title}`);
//         return translationCache[cacheKey];
//     }

//     try {
//         const res = await axios.post(
//             `https://translation.googleapis.com/language/translate/v2`,
//             {
//                 q: title,
//                 target: targetLang,
//                 key: apiKey,
//             },
//             {
//                 headers: { "Content-Type": "application/json" },
//             }
//         );

//         const translatedTitle = res.data.data.translations[0].translatedText || null;

//         console.log(`Received Translated Title: ${translatedTitle}`);
//         translationCache[cacheKey] = translatedTitle;

//         return translatedTitle;
//     } catch (error: unknown) {
//         console.error("Translation failed:", error);
//         return null;
//     }
// }

// export { translationCache, translateTitle };
export {}