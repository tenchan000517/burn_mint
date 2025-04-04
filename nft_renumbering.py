# python nft_renumbering.py --start 0 --end 1000 --base_path C:/villain-burn-nft

import os
import json
import shutil
import argparse
import re

def process_directory(base_dir, start_num, end_num):
    """
    指定されたディレクトリの画像とメタデータを処理する
    元の1つのファイルを複製して、指定された範囲の連番ファイルを作成する
    
    Args:
        base_dir (str): 処理するベースディレクトリ (vnft-a または vnft-b)
        start_num (int): 開始番号
        end_num (int): 終了番号
    """
    # ディレクトリパスの設定
    input_images_dir = os.path.join(base_dir, 'input', 'images')
    input_metadata_dir = os.path.join(base_dir, 'input', 'metadata')
    output_images_dir = os.path.join(base_dir, 'output', 'images')
    output_metadata_dir = os.path.join(base_dir, 'output', 'metadata')
    
    # 出力ディレクトリが存在しない場合は作成
    os.makedirs(output_images_dir, exist_ok=True)
    os.makedirs(output_metadata_dir, exist_ok=True)
    
    # 元のファイルパスを取得（1.pngと1.jsonを想定）
    original_image_path = os.path.join(input_images_dir, '1.png')
    original_metadata_path = os.path.join(input_metadata_dir, '1.json')
    
    # ファイルの存在チェック
    if not os.path.exists(original_image_path):
        print(f"エラー: 元の画像ファイルが見つかりません: {original_image_path}")
        return
    
    if not os.path.exists(original_metadata_path):
        print(f"エラー: 元のメタデータファイルが見つかりません: {original_metadata_path}")
        return
    
    # ディレクトリ名から NFT タイプを判断（'burn' または 'mint'）
    nft_type = 'burn' if 'vnft-a' in base_dir else 'mint'
    
    # 元のメタデータを読み込み
    with open(original_metadata_path, 'r', encoding='utf-8') as f:
        original_metadata = json.load(f)
    
    print(f"処理を開始: {base_dir} ({start_num}～{end_num})")
    
    # 指定された範囲でファイルを複製
    for new_num in range(start_num, end_num + 1):
        # 画像ファイルの複製
        dst_image_path = os.path.join(output_images_dir, f"{new_num}.png")
        shutil.copy2(original_image_path, dst_image_path)
        print(f"画像をコピー: {original_image_path} -> {dst_image_path}")
        
        # メタデータの複製と更新
        dst_metadata_path = os.path.join(output_metadata_dir, f"{new_num}.json")
        
        # メタデータのコピーを作成して更新
        metadata = original_metadata.copy()
        
        # name フィールドの更新
        if 'name' in metadata:
            # 既存の name から番号を抽出し、新しい番号に置き換える
            name_pattern = re.compile(r'(nft-\w+)#(\d+)')
            match = name_pattern.match(metadata['name'])
            if match:
                prefix = match.group(1)
                metadata['name'] = f"{prefix}#{new_num}"
            else:
                # パターンに一致しない場合は、単純に番号を付加
                metadata['name'] = f"nft-{nft_type}#{new_num}"
        
        # image フィールドの更新
        if 'image' in metadata:
            # URL 内の番号を更新
            image_pattern = re.compile(r'(https://0xmavillain\.com/data/nft/\w+/images/)(\d+)(\.png)')
            match = image_pattern.search(metadata['image'])
            if match:
                prefix = match.group(1)
                suffix = match.group(3)
                metadata['image'] = f"{prefix}{new_num}{suffix}"
            else:
                # パターンに一致しない場合は、全体を置き換え
                metadata['image'] = f"https://0xmavillain.com/data/nft/{nft_type}/images/{new_num}.png"
        
        # edition フィールドの更新（もし存在すれば）
        if 'edition' in metadata:
            metadata['edition'] = new_num
        
        # 更新したメタデータの保存
        with open(dst_metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        print(f"メタデータを処理: {original_metadata_path} -> {dst_metadata_path}")

def main():
    # コマンドライン引数のパース
    parser = argparse.ArgumentParser(description='NFT画像とメタデータを連番で複製するスクリプト')
    parser.add_argument('--start', type=int, default=0, help='開始番号 (デフォルト: 0)')
    parser.add_argument('--end', type=int, default=1000, help='終了番号 (デフォルト: 1000)')
    parser.add_argument('--base_path', type=str, default='C:/villain-burn-nft', help='ベースディレクトリパス')
    args = parser.parse_args()
    
    # 各ディレクトリの処理
    vnft_a_dir = os.path.join(args.base_path, 'vnft-a')
    vnft_b_dir = os.path.join(args.base_path, 'vnft-b')
    
    print(f"=== vnft-a の処理を開始（{args.start}〜{args.end}） ===")
    process_directory(vnft_a_dir, args.start, args.end)
    
    print(f"\n=== vnft-b の処理を開始（{args.start}〜{args.end}） ===")
    process_directory(vnft_b_dir, args.start, args.end)
    
    print("\n処理が完了しました。")

if __name__ == "__main__":
    main()