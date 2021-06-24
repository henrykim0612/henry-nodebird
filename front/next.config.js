/*
* Next 는 내부에 webpack 이 있지만 아래처럼 커스터마이징 할 수 있다.
* Webpack 말고도 Next 설정까지도 커스텀 할 수 있다.
* */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  compress: true, // 파일을 압축해
  webpack(config, { webpack }) {
    const prod = process.env.NODE_ENV === 'production';
    // plugins.push(new CompressPlugin()); // 이렇게 추가할 수 있음
    return {
      ...config,
      mode: prod ? 'production' : 'development',
      devtool: prod ? 'hidden-source-map' : 'eval', // hidden-source-map 으로 해야 배포해도 소스가 보이지 않음
      plugins: [
        ...config.plugins,
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /^\.\/ko$/), // moment.js 에서 여러 언어팩중에 한국어만 사용
      ],
      // module: {
      //   ...config.module,
      //   rules: [
      //     ...config.module.rules,
      //     {
      //
      //     },
      //   ],
      // },
    };
  },
});
