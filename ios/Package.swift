// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ProMove",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "ProMove",
            targets: ["ProMove"]
        ),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ProMove",
            path: "ProMove",
            resources: [
                .process("Resources")
            ]
        )
    ]
)
