package(default_visibility = ["//visibility:public"])

load("@npm//@bazel/typescript:index.bzl", "ts_config", "ts_project")
load("@npm//mocha:index.bzl", "mocha_test")

ts_config(
    name = "ts_config",
    src = "tsconfig.json",
    deps = [
        "//:tsconfig.json",
    ],
)

deps = [
    "@npm//apollo-server-koa,
    "@npm//bcrypt,
    "@npm//camelcase,
    "@npm//graphql,
    "@npm//grpc,
    "@npm//grpc-tools,
    "@npm//grpc_tools_node_protoc_ts,
    "@npm//jsonwebtoken,
    "@npm//koa",
    "@npm//koa-bodyparser,
    "@npm//koa-pino-logger",
    "@npm//koa-router,
    "@npm//mongoose,
    "@npm//mongoose-lean-virtuals,
    "@npm//pino,
    "@npm//ramda,
    "@npm//redis,
    "@npm//tsconfig-paths,
    "@npm//tscpaths",
]

ts_project(
    name = "compile",
    srcs = glob(
        [
            "**/*.ts",
        ],
        exclude = ["test/**/*.*"],
    ),
    declaration = True,
    declaration_map = True,
    extends = "//:tsconfig.json",
    source_map = True,
    tsconfig = "tsconfig.json",
    deps = deps,
)

filegroup(
    name = "extra",
    srcs = glob([
        "resources/**/*.*",
    ]),
)

mocha_test(
    name = "test",
    args = [
        "--config=projects/account/.mocharc.json",
        "--files=true",
        "--project=projects/account/tsconfig.json",
    ],
    data = glob([
        "src/**/*.ts",
        "resources/**/*.*",
        "test/**/*.*",
        "tsconfig.json",
        ".mocharc.json",
    ]) + deps + [
        "//:tsconfig.json",
        "@npm//ts-node",
        "@npm//@types/mocha",
        "@npm//chai",
        "@npm//chance",
        "@npm//chai-as-promised",
        "@npm//sinon",
    ],
)
