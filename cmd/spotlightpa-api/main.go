package main

import (
	"os"

	"github.com/carlmjohnson/exitcode"
	"github.com/spotlightpa/poor-richard/pkg/api"
)

func main() {
	exitcode.Exit(api.CLI(os.Args[1:]))
}
