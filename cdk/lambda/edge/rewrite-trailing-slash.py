def handler(event, context):
    # リクエストオブジェクトを取得し、存在しない場合は空の辞書を返す
    request = event.get('Records', [{}])[0].get('cf', {}).get('request', {})
    uri = request.get('uri', '')

    # ファイル名 ("/" で区切られたパスの最後) を取得
    filename = uri.split("/")[-1] if uri else ""

    # URIが"/"で終わる場合、またはファイル名が存在し、拡張子がない場合
    if uri.endswith("/"):
        request['uri'] = f"{uri}index.html"
    elif filename and "." not in filename:
        request['uri'] = f"{uri}/index.html"

    return request
