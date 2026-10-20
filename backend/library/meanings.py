import json
from concurrent.futures import FIRST_COMPLETED, ThreadPoolExecutor, wait
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from decouple import config


class DictionaryProvidersUnavailable(URLError):
    pass


def _request_json(url, headers=None):
    request = Request(url, headers={"User-Agent": "Jharo/1.0", **(headers or {})})
    with urlopen(request, timeout=5) as response:
        return json.loads(response.read().decode("utf-8"))


def _free_dictionary(word):
    url = f"https://freedictionaryapi.com/api/v1/entries/en/{quote(word, safe='')}?{urlencode({'translations': 'false'})}"
    data = _request_json(url)
    for entry in data.get("entries", []):
        for sense in entry.get("senses", []):
            definition = sense.get("definition")
            if definition:
                source = data.get("source", {})
                return {
                    "definition": definition,
                    "part_of_speech": entry.get("partOfSpeech", ""),
                    "phonetic": next((item.get("text", "") for item in entry.get("pronunciations", []) if item.get("text")), ""),
                    "example": next(iter(sense.get("examples", [])), ""),
                    "source_name": "FreeDictionaryAPI.com",
                    "source_url": source.get("url", ""),
                }
    return None


def _api_ninjas(word):
    api_key = config("NINJA_DICTIONARY_API_KEY", default="")
    if not api_key:
        return None

    url = f"https://api.api-ninjas.com/v1/dictionary?{urlencode({'word': word})}"
    data = _request_json(url, {"X-Api-Key": api_key})
    definition = data.get("definition")
    if not data.get("valid") or not definition:
        return None
    return {
        "definition": definition,
        "part_of_speech": "",
        "phonetic": "",
        "example": "",
        "source_name": "API Ninjas",
        "source_url": "https://api-ninjas.com/api/dictionary",
    }


def _merriam_webster(word):
    api_key = config("MERRIAM_WEBSTER_API_KEY", default="")
    if not api_key:
        return None

    url = (
        "https://www.dictionaryapi.com/api/v3/references/sd2/json/"
        f"{quote(word, safe='')}?{urlencode({'key': api_key})}"
    )
    data = _request_json(url)
    if not isinstance(data, list):
        return None

    for entry in data:
        if not isinstance(entry, dict):
            continue
        definitions = entry.get("shortdef", [])
        if not definitions:
            continue

        pronunciations = entry.get("hwi", {}).get("prs", [])
        phonetic = next(
            (pronunciation.get("mw", "") for pronunciation in pronunciations if pronunciation.get("mw")),
            "",
        )
        return {
            "definition": definitions[0],
            "part_of_speech": entry.get("fl", ""),
            "phonetic": phonetic,
            "example": "",
            "source_name": "Merriam-Webster Learner's Dictionary",
            "source_url": f"https://learnersdictionary.com/definition/{quote(word, safe='')}",
        }
    return None


def _dictionary_api_dev(word):
    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{quote(word, safe='')}"
    data = _request_json(url)
    if not isinstance(data, list) or not data:
        return None

    entry = data[0]
    phonetic = entry.get("phonetic", "")
    for sound in entry.get("phonetics", []):
        if sound.get("text"):
            phonetic = sound["text"]
            break

    for meaning in entry.get("meanings", []):
        definitions = meaning.get("definitions", [])
        if definitions and definitions[0].get("definition"):
            return {
                "definition": definitions[0]["definition"],
                "part_of_speech": meaning.get("partOfSpeech", ""),
                "phonetic": phonetic,
                "example": definitions[0].get("example", ""),
                "source_name": "Free Dictionary API",
                "source_url": "https://dictionaryapi.dev/",
            }
    return None


def fetch_word_meaning(word):
    """Return the first valid meaning from concurrent providers."""
    providers = (_free_dictionary, _api_ninjas, _merriam_webster, _dictionary_api_dev)

    executor = ThreadPoolExecutor(max_workers=len(providers))
    pending = {
        executor.submit(provider, word)
        for provider in providers
    }

    try:
        while pending:
            completed, pending = wait(
                pending,
                return_when=FIRST_COMPLETED,
            )

            for future in completed:
                try:
                    meaning = future.result()
                except HTTPError as error:
                    if error.code != 404:
                        # Log the error if needed.
                        pass
                    continue
                except (URLError, TimeoutError, OSError, ValueError, KeyError, TypeError):
                    continue

                if meaning:
                    return meaning

        return None

    finally:
        for future in pending:
            future.cancel()

        executor.shutdown(wait=False, cancel_futures=True)
