find ./csv -name "*.csv" -type f |
  while read file; do
    echo " $file"
    mv $file $file.icv
    iconv -f WINDOWS-1251 -t UTF-8 $file.icv >$file
    rm -f $file.icv
  done
