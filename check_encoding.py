#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import codecs

def add_bom_to_csv(file_path):
    """CSVファイルにBOMを追加する"""
    try:
        # ファイルを読み込む
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # BOMを追加して書き込む
        with open(file_path, 'wb') as f:
            f.write(codecs.BOM_UTF8)
            f.write(content.encode('utf-8'))
        
        print(f"BOMを追加しました: {file_path}")
        return True
    except Exception as e:
        print(f"エラー: {file_path} - {str(e)}")
        return False

def check_and_fix_csv_files(directory):
    """指定されたディレクトリ内のCSVファイルを検索し、BOMを追加する"""
    csv_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.csv'):
                csv_files.append(os.path.join(root, file))
    
    if not csv_files:
        print(f"CSVファイルが見つかりませんでした: {directory}")
        return
    
    print(f"{len(csv_files)}個のCSVファイルが見つかりました")
    
    for csv_file in csv_files:
        add_bom_to_csv(csv_file)

if __name__ == "__main__":
    # コンソール出力をUTF-8に設定
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    if len(sys.argv) > 1:
        directory = sys.argv[1]
    else:
        # カレントディレクトリをデフォルトとして使用
        directory = os.getcwd()
    
    check_and_fix_csv_files(directory)
